import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { $api } from '@/src/api/api';
import { useLoginErrorTranslations } from '@/src/api/errors/auth/login';
import { useMeErrorTranslations } from '@/src/api/errors/auth/me';
import { useRefreshTokenErrorTranslations } from '@/src/api/errors/auth/refresh';
import { useRegisterErrorTranslations } from '@/src/api/errors/auth/register';
import { ApiError } from '@/src/api/errors/types';
import { components } from '@/src/api/openapi';

// --- Constants ---
const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ERROR_TIMEOUT_MS = 3000;
const REFRESH_INTERVAL_MS = 60 * 1000; // Check token expiry every minute
const REFRESH_THRESHOLD_SECONDS = 5 * 60; // Refresh if token expires within 5 minutes

// --- Types ---
interface JwtPayload {
  exp: number; // Expiration time (Unix timestamp in seconds)
  [key: string]: any;
}

// Core DTO types from OpenAPI spec
type User = components['schemas']['UserDto'];
type LoginCredentials = components['schemas']['LoginRequestDto'];
type RegisterData = components['schemas']['RegisterRequestDto'];
type RefreshTokenRequestDto = components['schemas']['RefreshTokenRequestDto'];
type AuthResponseDto = components['schemas']['AuthResponseDto']; // Expected response for login/register/refresh

// Error code types from OpenAPI spec
type LoginErrorCode = components['schemas']['LoginErrorCode'];
type RegisterErrorCode = components['schemas']['RegisterErrorCode'];
type MeErrorCode = components['schemas']['AuthErrorCode'] | components['schemas']['UserErrorCode'];

// Type for handling TanStack Query errors specifically
type QueryError = {
  message: string;
  data?: { code?: MeErrorCode; message?: string | null };
  status?: number;
  response?: { status?: number };
};

// --- Context Definition ---
interface AuthContextType {
  token: string | null; // Current Access Token
  user: User | null; // Decoded user information
  login: (credentials: LoginCredentials) => Promise<void>; // Login function
  register: (registrationData: RegisterData) => Promise<void>; // Registration function
  logout: () => Promise<void>; // Logout function
  isLoading: boolean; // True during blocking auth operations (init, login, register)
  isInitializing: boolean; // True only during initial app load/auth check
  error: string | null; // Stores the last relevant error message
  isRefreshing: boolean; // True if a background refresh API call is currently in progress
}

// Create the context with an undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Helper Functions ---
/** Checks if a JWT token string is expired or invalid. */
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    // Token must have a numeric 'exp' claim
    if (!decoded || typeof decoded.exp !== 'number') {
      console.error('Invalid token structure or missing expiration');
      return true;
    }
    const expirationTime = decoded.exp * 1000; // Convert Unix seconds to milliseconds
    return Date.now() >= expirationTime; // Compare with current time
  } catch (error) {
    console.error('Error decoding/validating token:', error);
    return true; // Treat decoding errors as expired/invalid
  }
};

/** Calculates the remaining time (in seconds) until a token expires. */
const getTokenRemainingTime = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded || typeof decoded.exp !== 'number') {
      return null;
    }
    const expirationTime = decoded.exp * 1000;
    const remainingTime = expirationTime - Date.now();
    return Math.max(0, remainingTime / 1000); // Return seconds, minimum 0
  } catch (error) {
    console.error('Error getting token remaining time:', error);
    return null;
  }
};

// --- Auth Provider Component ---
// This component wraps the application and manages the authentication state.
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // --- State Variables ---
  const [token, setToken] = useState<string | null>(null); // Stores the current access token
  const [user, setUser] = useState<User | null>(null); // Stores user data derived from token/API
  const [isInitializing, setIsInitializing] = useState<boolean>(true); // Tracks initial loading state
  const [error, setError] = useState<string | null>(null); // Stores user-facing error messages

  // --- Refs ---
  const isRefreshing = useRef(false); // Tracks if a refresh API call is in flight (doesn't trigger re-render)
  const refreshIntervalId = useRef<NodeJS.Timeout | null>(null); // Holds the ID of the setInterval timer

  // --- Hooks ---
  const router = useRouter(); // For navigation
  // Translation hooks for specific error types
  const { t: tLoginError } = useLoginErrorTranslations();
  const { t: tRegisterError } = useRegisterErrorTranslations();
  const { t: tMeError } = useMeErrorTranslations();
  const { t: tRefreshError } = useRefreshTokenErrorTranslations();

  // --- API Mutations ---
  const loginMutation = $api.useMutation('post', '/api/auth/login');
  const registerMutation = $api.useMutation('post', '/api/auth/register');
  const refreshMutation = $api.useMutation('post', '/api/auth/refresh');

  // --- API Query ---
  // Fetches user data (`/me`) automatically when authenticated and initialized.
  const {
    data: meData,
    error: meQueryError,
    isLoading: isMeLoading, // Loading state specific to the /me query
    isError: isMeError,
  } = $api.useQuery(
    'get',
    '/api/auth/me',
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined }, // Add auth header if token exists
    {
      enabled: !!token && !isInitializing, // Query runs only when logged in and initialized
      retry: (failureCount, error: unknown) => {
        const hookError = error as QueryError;
        const status = hookError?.status ?? hookError?.response?.status;
        // Don't automatically retry critical auth errors (401/404)
        if (status === 401 || status === 404) {
          console.warn('/me query failed with status:', status, '- No retry.');
          return false;
        }
        return failureCount < 1; // Allow one retry for other errors
      },
      staleTime: 5 * 60 * 1000, // Cache user data for 5 minutes
      refetchOnWindowFocus: false, // Prevent refetching just on app focus
    }
  );

  // --- Effect for Auto-Clearing Transient Errors ---
  // Clears the error message after a short delay.
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (error) {
      timerId = setTimeout(() => {
        setError(null);
      }, ERROR_TIMEOUT_MS);
    }
    // Cleanup function to clear the timer if the error changes or component unmounts
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [error]); // Reruns only when the error state changes

  // --- Core Logout Function ---
  // Centralized logic for logging out the user, clearing state, storage, and navigating.
  const handleLogout = useCallback(
    async (displayError?: string) => {
      console.log('Executing handleLogout. Display Error:', displayError);
      setError(displayError || null); // Show optional error message
      setUser(null); // Clear user state
      setToken(null); // Clear token state (this triggers effects depending on token)
      isRefreshing.current = false; // Reset refresh flag

      // Stop the periodic refresh timer if it's running
      if (refreshIntervalId.current) {
        console.log('Clearing interval due to logout.');
        clearInterval(refreshIntervalId.current);
        refreshIntervalId.current = null;
      }

      // Remove tokens from persistent storage
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);

      // Redirect to the public/login area
      router.replace('/'); // Adjust route if needed
    },
    [router]
  ); // Dependency: router for navigation

  // --- Refresh Token Logic ---
  // Handles the API call to refresh the access token using the refresh token.
  const attemptTokenRefresh = useCallback(async (): Promise<boolean> => {
    // Prevent multiple concurrent refresh attempts
    if (isRefreshing.current) {
      console.log('Refresh already in progress, skipping.');
      return false;
    }

    // Read tokens from storage directly inside the function for accuracy
    const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    const storedAccessToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    // Check if both tokens (required by backend DTO) are available
    if (!storedRefreshToken || !storedAccessToken) {
      console.log('Required token(s) missing from storage for refresh attempt.');
      return false; // Signal failure; caller decides the consequence (e.g., logout)
    }

    console.log('Attempting token refresh API call...');
    isRefreshing.current = true; // Mark refresh as in-progress
    setError(null); // Clear previous errors

    try {
      // Construct payload as required by the backend's RefreshTokenRequestDto
      const refreshPayload: RefreshTokenRequestDto = {
        token: storedAccessToken, // Include current (potentially expired) access token
        refreshToken: storedRefreshToken,
      };

      // Perform the mutation
      const response = await refreshMutation.mutateAsync({ body: refreshPayload });
      const responseData = response as AuthResponseDto; // Assert the expected response type
      const newAccessToken = responseData?.token;
      const newRefreshToken = responseData?.refreshToken;

      // Validate the response from the backend
      if (!newAccessToken) {
        console.error('Refresh response did not contain a new access token.');
        isRefreshing.current = false; // Reset flag
        return false; // Indicate failure
      }

      // Refresh succeeded: Update token state and storage
      console.log('Token refresh successful.');
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, newAccessToken);
      setToken(newAccessToken); // Update token state (triggers other effects)

      // Handle potential refresh token rotation
      if (newRefreshToken) {
        console.log('Received new rotated refresh token.');
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      }

      isRefreshing.current = false; // Reset flag
      return true; // Indicate success
    } catch (err: unknown) {
      // Handle API call failure
      console.error('Token refresh API call failed:', err);
      isRefreshing.current = false; // Reset flag

      // Set error message based on API error code
      const apiError = err as ApiError<components['schemas']['AuthErrorCode']>;
      const errorCode = apiError.data?.code;
      const errorMessage = errorCode
        ? tRefreshError(errorCode)
        : 'Your session could not be refreshed. Please log in again.';
      setError(errorMessage); // Set error state for potential display

      return false; // Indicate failure
    }
  }, [refreshMutation, handleLogout, tRefreshError]); // Dependencies are stable functions/refs

  // --- Initialization Logic (Runs ONCE on component mount) ---
  // Checks storage for tokens, validates them, and attempts refresh if necessary.
  useEffect(() => {
    console.log('Running initializeAuth effect...');
    let isMounted = true; // Track mount status for async operations

    const initializeAuth = async () => {
      let storedTokenValue: string | null = null;
      let storedRefreshTokenValue: string | null = null;
      // Sentinel to determine if setToken needs explicit call in finally block
      let finalTokenToSet: string | null | undefined = undefined;

      try {
        // Read tokens from storage
        const results = await AsyncStorage.multiGet([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
        storedTokenValue = results[0]?.[1] ?? null;
        storedRefreshTokenValue = results[1]?.[1] ?? null;

        console.log(
          `Initialization: Found AccessToken=${!!storedTokenValue}, RefreshToken=${!!storedRefreshTokenValue}`
        );

        // Scenario 1: Valid access token found
        if (storedTokenValue && !isTokenExpired(storedTokenValue)) {
          console.log('Valid access token found during init.');
          finalTokenToSet = storedTokenValue; // Mark token to be set
          if (isMounted) {
            setUser(null); // Reset user data, /me query will refetch
            setError(null);
          }
        }
        // Scenario 2: Expired/missing access token, but valid refresh token found
        else if (storedRefreshTokenValue) {
          console.log('Access token missing or expired, attempting refresh...');
          // Backend requires the (potentially expired) access token for the refresh call
          if (storedTokenValue) {
            // Temporarily set state to make token available for attemptTokenRefresh
            if (isMounted) {
              setToken(storedTokenValue);
            }
            const refreshSuccess = await attemptTokenRefresh(); // Attempt refresh
            if (refreshSuccess) {
              // Refresh succeeded, token state updated internally
              console.log('Initial refresh successful.');
              finalTokenToSet = undefined; // Signal that setToken was handled
              if (isMounted) {
                setUser(null); // Reset user data
                setError(null);
              }
            } else {
              // Refresh failed
              console.log('Initial refresh failed.');
              finalTokenToSet = null; // Ensure logged out state
              if (isMounted) await handleLogout(error || 'Your session could not be refreshed.');
            }
          } else {
            // Cannot refresh if access token is required by DTO but totally missing
            console.log(
              'Cannot attempt initial refresh: Access token required by DTO but missing.'
            );
            finalTokenToSet = null;
            if (isMounted) await handleLogout('Invalid session state.');
          }
        }
        // Scenario 3: No valid tokens found at all
        else {
          console.log('No valid tokens found during init.');
          finalTokenToSet = null; // Ensure logged out state
          if (isMounted) {
            setUser(null);
            setError(null);
          }
        }
      } catch (e) {
        // Handle errors during storage access or initial logic
        console.error('Failed to initialize auth:', e);
        finalTokenToSet = null;
        if (isMounted) {
          await handleLogout('Failed to load session.');
        }
      } finally {
        // This runs after try/catch, regardless of outcome
        console.log('Initialization sequence finished.');
        if (isMounted) {
          // Set the final token state unless refresh handled it
          if (finalTokenToSet !== undefined) {
            console.log(
              `Final token state determined during init: ${finalTokenToSet ? 'Exists' : 'Null'}`
            );
            setToken(finalTokenToSet);
          }
          // Mark initialization as complete
          console.log('Setting isInitializing to false');
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    // Cleanup function to prevent state updates if component unmounts during async ops
    return () => {
      console.log('initializeAuth effect cleanup.');
      isMounted = false;
    };
    // ** CRUCIAL: Empty dependency array `[]` ensures this effect runs only ONCE per component mount **
  }, []);

  // --- Periodic Refresh Check ---
  // Sets up an interval timer to check token expiry and trigger refresh proactively.
  useEffect(() => {
    // Conditions to run the interval: App initialized AND user is logged in (token exists)
    if (isInitializing || !token) {
      // If conditions are not met, ensure any existing interval is cleared
      if (refreshIntervalId.current) {
        console.log('Clearing interval: Conditions not met (initializing or no token).');
        clearInterval(refreshIntervalId.current);
        refreshIntervalId.current = null;
      }
      return; // Don't setup the interval
    }

    // Setup interval only if it's not already running
    if (!refreshIntervalId.current) {
      console.log('Setting up periodic refresh check interval.');
      refreshIntervalId.current = setInterval(async () => {
        // Prevent check if a refresh API call is already in progress
        if (isRefreshing.current) {
          return;
        }

        // Read token directly from storage for the most accurate time check
        const currentTokenInStorage = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!currentTokenInStorage) {
          // Token might have been removed externally (e.g., multi-device logout)
          console.log('Interval check: Token missing from storage, clearing interval.');
          if (refreshIntervalId.current) {
            clearInterval(refreshIntervalId.current);
            refreshIntervalId.current = null;
          }
          // Consider forcing logout if token disappears unexpectedly
          // await handleLogout("Session ended unexpectedly.");
          return;
        }

        const remainingTime = getTokenRemainingTime(currentTokenInStorage);

        // Check if token expiry is within the refresh threshold
        if (remainingTime !== null && remainingTime < REFRESH_THRESHOLD_SECONDS) {
          console.log(
            `Periodic Check: Token nearing expiration (${remainingTime}s left). Attempting refresh.`
          );
          const refreshSuccess = await attemptTokenRefresh();
          // If refresh fails during the interval check, force a logout
          if (!refreshSuccess) {
            console.log('Periodic refresh failed. Logging out.');
            await handleLogout(error || 'Your session could not be refreshed.');
          }
        }
      }, REFRESH_INTERVAL_MS); // Interval frequency (e.g., every minute)
    }

    // Cleanup function: Clears the interval when the effect re-runs or component unmounts
    return () => {
      if (refreshIntervalId.current) {
        console.log('Clearing periodic refresh check interval (Effect cleanup).');
        clearInterval(refreshIntervalId.current);
        refreshIntervalId.current = null; // Reset ref
      }
    };
    // Re-run this effect only if initialization status or token presence changes
  }, [token, isInitializing]); // Simplified dependencies

  // --- Update State based on /me Query Results ---
  // Handles the outcome of the automatic `/me` query.
  useEffect(() => {
    // Don't process results during initial app load
    if (isInitializing) {
      return;
    }

    // Logic runs when the query's state changes
    if (isMeLoading) {
      // Can handle /me specific loading state if needed, separate from overall isLoading
    } else if (isMeError && meQueryError) {
      const hookError = meQueryError as QueryError;
      const status = hookError?.status ?? hookError?.response?.status;
      console.error('Error fetching /me:', {
        status,
        code: hookError?.data?.code,
        message: hookError?.message,
      });

      // If /me returns 401/404, it indicates the current token is invalid. Logout unless a refresh is fixing it.
      if ((status === 401 || status === 404) && !isRefreshing.current) {
        console.warn(`/me fetch failed with ${status} while not refreshing, logging out.`);
        handleLogout('Your session is invalid. Please log in again.');
      } else if (!isRefreshing.current) {
        // Show non-critical /me errors only if not currently refreshing
        const errorCode = hookError?.data?.code as MeErrorCode | undefined;
        const apiMessage = hookError?.data?.message;
        const errorMessage = errorCode
          ? tMeError(errorCode)
          : apiMessage || hookError?.message || 'Failed to load user details.';
        setError(errorMessage);
        setUser(null); // Clear potentially stale user data
      }
    } else if (meData) {
      // /me query succeeded: Validate token again (edge case) and update user state
      if (isTokenExpired(token)) {
        // Check current token state
        console.warn('Token expired right after successful /me fetch. Logging out.');
        handleLogout('Your session expired. Please log in again.');
      } else {
        // All good: User is fetched and token is valid
        setUser(meData);
        setError(null); // Clear any previous non-fatal error
      }
    } else if (!token) {
      // If token became null after initialization (e.g., via logout), clear user state
      setUser(null);
      setError(null);
    }
  }, [
    // Dependencies that trigger re-evaluation of the /me query results
    isInitializing,
    isMeLoading,
    isMeError,
    meQueryError,
    meData,
    token, // Re-check if token changes (e.g., after refresh)
    tMeError, // Translation function
    handleLogout, // Logout function
  ]);

  // --- Helper to Update Tokens (State & Storage) after Login/Register ---
  // Centralized logic for handling successful authentication responses.
  const handleTokenUpdate = useCallback(
    async (authResponse: AuthResponseDto) => {
      const { token: newAccessToken, refreshToken: newRefreshToken, ...userData } = authResponse;

      // Basic validation of the response
      if (!newAccessToken) {
        console.error('Auth response missing access token!');
        await handleLogout('Authentication failed: Invalid server response.');
        return; // Prevent further execution
      }

      // Update React state first for immediate UI feedback
      setToken(newAccessToken);
      setUser(userData as User); // Assume userData structure matches UserDto
      setError(null); // Clear previous login/register errors

      // Prepare tokens for persistent storage
      const itemsToStore: [string, string][] = [[AUTH_TOKEN_KEY, newAccessToken]];
      if (newRefreshToken) {
        itemsToStore.push([REFRESH_TOKEN_KEY, newRefreshToken]);
      } else {
        // Ensure old refresh token is removed if backend doesn't rotate/return one
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      }

      // Save tokens to AsyncStorage
      try {
        await AsyncStorage.multiSet(itemsToStore);
        console.log(
          `Tokens updated. AccessToken stored. RefreshToken ${newRefreshToken ? 'stored' : 'not provided/removed'}.`
        );
      } catch (storageError) {
        // Handle critical storage failure, likely requires logout
        console.error('CRITICAL: Failed to store tokens:', storageError);
        await handleLogout('Failed to save session. Please log in again.');
      }
    },
    [handleLogout]
  ); // Dependency: handleLogout for error case

  // --- login function ---
  // Exposed via context to trigger the login process.
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setError(null); // Clear previous errors
      isRefreshing.current = false; // Reset refresh flag
      try {
        console.log('Logging in...');
        const data = (await loginMutation.mutateAsync({ body: credentials })) as AuthResponseDto;
        console.log('Login response received');
        await handleTokenUpdate(data); // Update state and storage
        router.replace('/tabs'); // Navigate after successful login
      } catch (err: unknown) {
        console.error('Login failed:', err);
        const apiError = err as ApiError<LoginErrorCode>;
        const errorCode = apiError.data?.code;
        // Use central logout handler for cleanup on failure
        await handleLogout(errorCode ? tLoginError(errorCode) : 'Login failed. Please try again.');
      }
    },
    [loginMutation, handleTokenUpdate, handleLogout, router, tLoginError] // Dependencies
  );

  // --- register function ---
  // Exposed via context to trigger the registration process.
  const register = useCallback(
    async (registrationData: RegisterData) => {
      setError(null); // Clear previous errors
      isRefreshing.current = false; // Reset refresh flag
      try {
        console.log('Registering...');
        const data = (await registerMutation.mutateAsync({
          body: registrationData,
        })) as AuthResponseDto;
        console.log('Register response received');
        await handleTokenUpdate(data); // Update state and storage
        router.replace('/tabs'); // Navigate after successful registration
      } catch (err: unknown) {
        console.error('Registration failed:', err);
        const apiError = err as ApiError<RegisterErrorCode>;
        const errorCode = apiError?.data?.code;
        const backendMessage = apiError?.data?.message ?? (err as any)?.message;
        // Use central logout handler for cleanup on failure
        await handleLogout(
          errorCode
            ? tRegisterError(errorCode)
            : backendMessage || 'Registration failed. Please try again.'
        );
      }
    },
    [registerMutation, handleTokenUpdate, handleLogout, router, tRegisterError] // Dependencies
  );

  // --- public logout function exposed by context ---
  // Allows components to trigger a manual logout.
  const logout = useCallback(async () => {
    console.log('Manual logout triggered.');
    await handleLogout(); // Use central handler without specific error message
  }, [handleLogout]); // Dependency

  // Combined loading state for UI feedback during critical operations
  const combinedIsLoading = isInitializing || loginMutation.isPending || registerMutation.isPending;

  // Context value provided to consuming components
  const value: AuthContextType = {
    token, // Current access token
    user, // Current user data
    login, // Login function
    register, // Register function
    logout, // Logout function
    isLoading: combinedIsLoading, // True during init/login/register
    isInitializing, // True only during initial load
    error, // Last relevant error message
    isRefreshing: isRefreshing.current, // True if a refresh API call is in flight
  };

  // Provide the context value to children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook for Consuming Context ---
// Provides a convenient way for components to access the auth context.
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Ensure the hook is used within a provider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Prop Types for Provider ---
interface AuthProviderProps {
  children: ReactNode; // Allows wrapping components
}
