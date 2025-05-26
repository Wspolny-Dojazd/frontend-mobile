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
import { ToastAndroid } from 'react-native';

import { $api } from '@/src/api/api';
// Import error translation hooks
import { useLoginErrorTranslations } from '@/src/api/errors/auth/login';
import { useMeErrorTranslations } from '@/src/api/errors/auth/me';
import { useRefreshTokenErrorTranslations } from '@/src/api/errors/auth/refresh';
import { useRegisterErrorTranslations } from '@/src/api/errors/auth/register';
import { ApiError } from '@/src/api/errors/types';
import { components } from '@/src/api/openapi'; // Assuming this imports generated OpenAPI types

// --- Constants ---
const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ERROR_TIMEOUT_MS = 3000; // Duration to display transient errors
const REFRESH_INTERVAL_MS = 60 * 1000; // How often to check token expiry (e.g., every 60 seconds)
export const REFRESH_THRESHOLD_SECONDS = 5 * 60; // Refresh token if it expires within this time (e.g., 5 minutes)

// --- Types ---
interface JwtPayload {
  exp: number; // Expiration time (Unix timestamp in seconds)
  [key: string]: any; // Allow other claims
}

// OpenAPI Schema Types
type User = components['schemas']['UserDto'];
type LoginCredentials = components['schemas']['LoginRequestDto'];
type RegisterData = components['schemas']['RegisterRequestDto'];
type RefreshTokenRequestDto = components['schemas']['RefreshTokenRequestDto'];
// Represents the expected response structure for login, register, and refresh operations
type AuthResponseDto = components['schemas']['AuthResponseDto'];

// Specific Error Code Types from OpenAPI spec for better error handling
type LoginErrorCode = components['schemas']['LoginErrorCode'];
type RegisterErrorCode = components['schemas']['RegisterErrorCode'];
// Combined type for /me endpoint errors
type MeErrorCode = components['schemas']['AuthErrorCode'] | components['schemas']['UserErrorCode'];
type RefreshErrorCode = components['schemas']['AuthErrorCode']; // Assuming refresh uses AuthErrorCode

// Type definition for errors potentially coming from React Query wrappers
type QueryError = {
  message: string;
  data?: { code?: MeErrorCode | string; message?: string | null }; // Allow generic code string too
  status?: number;
  response?: { status?: number };
};

// --- Context Definition ---
interface AuthContextType {
  token: string | null; // Current Access Token
  user: User | null; // Logged-in user details
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (registrationData: RegisterData) => Promise<void>;
  logout: () => Promise<void>; // Manual logout trigger
  isLoading: boolean; // True during critical blocking operations (initial load, login, register)
  isInitializing: boolean; // True only during the initial auth state determination on app start
  error: string | null; // Stores the last user-facing error message
  isRefreshing: boolean; // True if a background token refresh API call is currently in progress
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Helper Functions ---
/**
 * Checks if a JWT token string is expired or structurally invalid.
 * @param token The JWT string or null.
 * @returns True if the token is null, expired, or cannot be decoded/validated, false otherwise.
 */
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded || typeof decoded.exp !== 'number') {
      return true; // Invalid structure or missing expiration
    }
    const expirationTime = decoded.exp * 1000; // Convert Unix seconds to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    // Treat decoding errors as expired/invalid
    return true;
  }
};

/**
 * Calculates the remaining time (in seconds) until a token expires.
 * @param token The JWT string or null.
 * @returns Remaining seconds (minimum 0), or null if token is invalid/missing.
 */
const getTokenRemainingTime = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded || typeof decoded.exp !== 'number') {
      return null;
    }
    const expirationTime = decoded.exp * 1000;
    const remainingTimeMs = expirationTime - Date.now();
    return Math.max(0, remainingTimeMs / 1000); // Return seconds, minimum 0
  } catch (error) {
    return null; // Treat decoding errors as invalid
  }
};

// --- Auth Provider Component ---
/**
 * Manages authentication state (tokens, user data), handles login, registration,
 * logout, token refresh, and provides this state to the application via context.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // --- State ---
  const [token, setToken] = useState<string | null>(null); // Access token
  const [user, setUser] = useState<User | null>(null); // User data
  const [isInitializing, setIsInitializing] = useState<boolean>(true); // Initial auth check status
  const [error, setError] = useState<string | null>(null); // User-facing errors

  // --- Refs ---
  // Use a ref for isRefreshing to avoid re-renders just for background refresh status changes
  const isRefreshing = useRef(false);
  const refreshIntervalId = useRef<NodeJS.Timeout | null>(null); // ID for the periodic check timer

  // --- Hooks ---
  const router = useRouter();
  // Error translation hooks
  const { t: tLoginError } = useLoginErrorTranslations();
  const { t: tRegisterError } = useRegisterErrorTranslations();
  const { t: tMeError } = useMeErrorTranslations();
  const { t: tRefreshError } = useRefreshTokenErrorTranslations();

  // --- API Actions (Mutations & Query) ---
  const loginMutation = $api.useMutation('post', '/api/auth/login');
  const registerMutation = $api.useMutation('post', '/api/auth/register');
  const refreshMutation = $api.useMutation('post', '/api/auth/refresh');

  // Automatically fetches user data (/me) when authenticated and initialized
  const {
    data: meData,
    error: meQueryError,
    isLoading: isMeLoading,
    isError: isMeError,
  } = $api.useQuery(
    'get',
    '/api/auth/me',
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined }, // Dynamic headers
    {
      enabled: !!token && !isInitializing, // Only run if logged in and past initial load
      retry: (failureCount, error: unknown) => {
        // Prevent automatic retries on critical auth errors (401 Unauthorized, 404 Not Found)
        const queryError = error as QueryError;
        const status = queryError?.status ?? queryError?.response?.status;
        if (status === 401 || status === 404) {
          return false;
        }
        return failureCount < 1; // Allow one retry for other potentially transient errors
      },
      staleTime: 5 * 60 * 1000, // Cache user data for 5 minutes
      refetchOnWindowFocus: false, // Avoid potentially unnecessary refetches on app focus
    }
  );

  // --- Effect for Auto-Clearing Transient Errors ---
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (error) {
      timerId = setTimeout(() => setError(null), ERROR_TIMEOUT_MS);
    }
    // Clear timeout if error changes or component unmounts
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [error]);

  // --- Core Logout Function ---
  // Centralized logic for clearing session state, storage, and redirecting.
  const handleLogout = useCallback(
    async (displayError?: string) => {
      setError(displayError || null); // Display an optional error message on logout
      setUser(null);
      setToken(null); // Setting token to null triggers cleanup effects
      isRefreshing.current = false;

      // Clear the periodic refresh check interval
      if (refreshIntervalId.current) {
        clearInterval(refreshIntervalId.current);
        refreshIntervalId.current = null;
      }

      // Remove tokens from persistent storage
      try {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
      } catch (storageError) {
        console.error('Failed to remove tokens from storage during logout:', storageError);
        // Non-fatal for logout flow, but indicates storage issue
      }

      // Redirect to the main public route (e.g., login screen)
      router.replace('/'); // Adjust the target route if needed
    },
    [router] // router is the only dependency needed here
  );

  // --- Refresh Token Logic ---
  // Attempts to get a new access token using the stored refresh token.
  const attemptTokenRefresh = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent refresh attempts
    if (isRefreshing.current) return false;

    const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    // Backend might require the current (possibly expired) access token too
    const storedAccessToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    if (!storedRefreshToken || !storedAccessToken) {
      // Cannot refresh if essential tokens are missing
      return false;
    }

    isRefreshing.current = true;
    setError(null); // Clear previous errors before attempting

    try {
      const refreshPayload: RefreshTokenRequestDto = {
        token: storedAccessToken,
        refreshToken: storedRefreshToken,
      };
      const response = await refreshMutation.mutateAsync({ body: refreshPayload });
      const responseData = response as AuthResponseDto; // Assume successful response shape

      const newAccessToken = responseData?.token;
      const newRefreshToken = responseData?.refreshToken; // Handle potential refresh token rotation

      if (!newAccessToken) {
        throw new Error('Refresh response did not contain a new access token.');
      }

      // Success: Update token state and storage
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, newAccessToken);
      setToken(newAccessToken); // Update state, which triggers dependent effects (like /me query)

      if (newRefreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      }

      isRefreshing.current = false;
      return true; // Signal success
    } catch (err: unknown) {
      isRefreshing.current = false;

      // Translate API error code if possible, otherwise show generic message
      const apiError = err as ApiError<RefreshErrorCode>;
      const errorCode = apiError.data?.code;
      const errorMessage = errorCode
        ? tRefreshError(errorCode)
        : 'Your session could not be refreshed. Please log in again.';

      // Show Toast instead of logging to console
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);

      // Logout is typically required if refresh fails
      await handleLogout(errorMessage);
      return false; // Signal failure
    }
  }, [refreshMutation, handleLogout, tRefreshError]); // Dependencies: Stable mutation, logout, and translation

  // --- Initialization Logic (Runs ONCE on mount) ---
  // Checks storage for existing tokens, validates them, and establishes initial auth state.
  useEffect(() => {
    let isMounted = true; // Track mount status for async operations

    const initializeAuth = async () => {
      let storedToken: string | null = null;
      let storedRefreshToken: string | null = null;

      try {
        const results = await AsyncStorage.multiGet([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
        storedToken = results[0]?.[1] ?? null;
        storedRefreshToken = results[1]?.[1] ?? null;

        if (storedToken && !isTokenExpired(storedToken)) {
          // Valid access token found - Set it and proceed (user data will be fetched by /me query)
          if (isMounted) {
            setToken(storedToken);
          }
        } else if (storedRefreshToken) {
          // Access token expired/missing, but refresh token exists - Attempt refresh
          if (storedToken) {
            // Temporarily set expired token for the refresh API call if needed by backend DTO
            if (isMounted) setToken(storedToken);
            const refreshSuccess = await attemptTokenRefresh();
            if (!refreshSuccess && isMounted) {
              // If initial refresh fails, ensure clean logout state
              // Error message/logout handled within attemptTokenRefresh
            }
            // If refresh succeeds, attemptTokenRefresh handles setting the new token
          } else {
            // Cannot refresh if backend requires the (expired) access token DTO field but it's missing
            if (isMounted) await handleLogout('Invalid session state.');
          }
        } else {
          // No valid tokens found - Ensure logged out state
          if (isMounted) {
            setToken(null); // Explicitly set null if no valid tokens
            setUser(null);
          }
        }
      } catch (e) {
        console.error('Failed to initialize authentication state:', e);
        if (isMounted) {
          await handleLogout('Failed to load session.');
        }
      } finally {
        // Mark initialization complete regardless of outcome
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    // Cleanup: Prevent state updates if component unmounts during async init
    return () => {
      isMounted = false;
    };
    // ** IMPORTANT: Empty dependency array `[]` ensures this runs only ONCE **
  }, [attemptTokenRefresh, handleLogout]); // Include stable callbacks used inside

  // --- Periodic Refresh Check ---
  // Sets up an interval to proactively refresh the token before it expires.
  useEffect(() => {
    // Only run the interval check if initialized and logged in
    if (isInitializing || !token) {
      // Clear any existing interval if conditions are not met
      if (refreshIntervalId.current) {
        clearInterval(refreshIntervalId.current);
        refreshIntervalId.current = null;
      }
      return; // Exit effect early
    }

    // Setup interval only if one isn't already running
    if (!refreshIntervalId.current) {
      refreshIntervalId.current = setInterval(async () => {
        // Skip check if a refresh is already in progress
        if (isRefreshing.current) return;

        // Check remaining time using the token *currently in state*
        // Reading from storage again here might be slightly more accurate but adds async overhead
        // to every interval tick. Using state token is simpler for the check threshold logic.
        const remainingTime = getTokenRemainingTime(token);

        if (remainingTime !== null && remainingTime < REFRESH_THRESHOLD_SECONDS) {
          // Token nearing expiration, attempt refresh
          const refreshSuccess = await attemptTokenRefresh();
          if (!refreshSuccess) {
            // If refresh fails during periodic check, logout is handled within attemptTokenRefresh
          }
        }
        // If token is valid and not near expiry, do nothing.
      }, REFRESH_INTERVAL_MS);
    }

    // Cleanup: Clear interval when token changes, initialization status changes, or component unmounts
    return () => {
      if (refreshIntervalId.current) {
        clearInterval(refreshIntervalId.current);
        refreshIntervalId.current = null;
      }
    };
  }, [token, isInitializing, attemptTokenRefresh]); // Re-run effect if token or init status changes

  // --- Update State based on /me Query Results ---
  // Manages user state and handles errors from the automatic `/me` fetch.
  useEffect(() => {
    // Don't process /me results during initial load
    if (isInitializing) return;

    if (isMeLoading) {
      // Optional: Handle loading state specific to fetching user data if needed
    } else if (isMeError && meQueryError) {
      const queryError = meQueryError as QueryError;
      const status = queryError?.status ?? queryError?.response?.status;
      console.error('Error fetching /me data:', {
        status,
        data: queryError?.data,
        message: queryError?.message,
      });

      // If /me returns 401/404, token is invalid. Logout unless a refresh is *currently* fixing it.
      if ((status === 401 || status === 404) && !isRefreshing.current) {
        handleLogout('Your session is invalid. Please log in again.');
      } else if (!isRefreshing.current) {
        // Show other /me errors only if not currently handling a refresh
        const errorCode = queryError?.data?.code as MeErrorCode | undefined;
        const errorMessage = errorCode
          ? tMeError(errorCode)
          : queryError?.data?.message || queryError?.message || 'Failed to load user details.';
        setError(errorMessage);
        setUser(null); // Clear potentially stale user data on error
      }
    } else if (meData) {
      // /me query succeeded: Update user state
      // Double-check token validity as an edge case safeguard
      if (isTokenExpired(token)) {
        handleLogout('Your session expired. Please log in again.');
      } else {
        setUser(meData as User); // Assume meData matches User DTO structure
        setError(null); // Clear any previous non-fatal errors
      }
    } else if (!token && !isInitializing) {
      // Explicitly clear user if token becomes null after initialization (logout)
      setUser(null);
      setError(null);
    }
  }, [isInitializing, isMeLoading, isMeError, meQueryError, meData, token, tMeError, handleLogout]);

  // --- Helper to Update Tokens (State & Storage) after Login/Register/Refresh ---
  const handleTokenUpdate = useCallback(
    async (authResponse: AuthResponseDto) => {
      const { token: newAccessToken, refreshToken: newRefreshToken, ...userData } = authResponse;

      if (!newAccessToken) {
        // This case should ideally be caught by API call error handling, but double-check
        console.error('Auth response missing access token!');
        await handleLogout('Authentication failed: Invalid server response.');
        return;
      }

      // Update state first for responsiveness
      setToken(newAccessToken);
      setUser(userData as User); // Assume rest of properties form the User object
      setError(null);

      // Update persistent storage
      try {
        const itemsToStore: [string, string][] = [[AUTH_TOKEN_KEY, newAccessToken]];
        if (newRefreshToken) {
          itemsToStore.push([REFRESH_TOKEN_KEY, newRefreshToken]);
        } else {
          // Ensure old refresh token is removed if not rotated/returned
          await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        }
        await AsyncStorage.multiSet(itemsToStore);
      } catch (storageError) {
        console.error('CRITICAL: Failed to store authentication tokens:', storageError);
        // If storage fails, the session isn't persisted. Logout might be necessary.
        await handleLogout('Failed to save your session. Please try logging in again.');
        // Rethrow or handle more gracefully depending on requirements
      }
    },
    [handleLogout] // handleLogout is the main dependency
  );

  // --- Login Function ---
  // Exposed via context for components to call.
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setError(null);
      isRefreshing.current = false;
      try {
        const data = (await loginMutation.mutateAsync({ body: credentials })) as AuthResponseDto;
        await handleTokenUpdate(data);
        router.replace('/tabs'); // redirect on success
      } catch (err: unknown) {
        console.error('Login failed:', err);
        const apiError = err as ApiError<LoginErrorCode>;
        const errorCode = apiError.data?.code;
        const errorMessage = errorCode ? tLoginError(errorCode) : 'Login failed. Please try again.';

        // 🔧 NIE wykonuj handleLogout tutaj:
        setToken(null);
        setUser(null);
        setError(errorMessage);
      }
    },
    [loginMutation, handleTokenUpdate, router, tLoginError]
  );

  // --- Register Function ---
  // Exposed via context for components to call.
  const register = useCallback(
    async (registrationData: RegisterData) => {
      setError(null);
      isRefreshing.current = false;
      try {
        const data = (await registerMutation.mutateAsync({
          body: registrationData,
        })) as AuthResponseDto;
        await handleTokenUpdate(data);
        router.replace('/tabs'); // redirect on success
      } catch (err: unknown) {
        console.error('Registration failed:', err);
        const apiError = err as ApiError<RegisterErrorCode>;
        const errorCode = apiError?.data?.code;
        const backendMessage = apiError?.data?.message ?? (err as any)?.message;

        // 🔧 NIE wykonuj handleLogout tutaj:
        setToken(null);
        setUser(null);
        setError(
          errorCode
            ? tRegisterError(errorCode)
            : backendMessage || 'Registration failed. Please try again.'
        );
      }
    },
    [registerMutation, handleTokenUpdate, router, tRegisterError]
  );

  // --- Manual Logout Function ---
  // Exposed via context, simply calls the central handler.
  const logout = useCallback(async () => {
    await handleLogout(); // Use central handler without a specific error message
  }, [handleLogout]);

  // Combined loading state reflects critical, blocking operations
  const combinedIsLoading = isInitializing || loginMutation.isPending || registerMutation.isPending;

  // Context value provided to children
  const value: AuthContextType = {
    token,
    user,
    login,
    register,
    logout,
    isLoading: combinedIsLoading,
    isInitializing,
    error,
    // Provide the current refresh status from the ref
    isRefreshing: isRefreshing.current,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook for Consuming Context ---
/**
 * Access the authentication context. Must be used within an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Prop Types for Provider ---
interface AuthProviderProps {
  children: ReactNode;
}
