// src/context/authContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
// Removed AppState import

import { $api } from '@/src/api/api';
import { useLoginErrorTranslations } from '@/src/api/errors/auth/login';
import { useMeErrorTranslations } from '@/src/api/errors/auth/me';
import { useRegisterErrorTranslations } from '@/src/api/errors/auth/register';
import { ApiError } from '@/src/api/errors/types'; // Keep if used elsewhere
import { components } from '@/src/api/openapi';

// Types
type User = components['schemas']['AuthResponseDto'];
type LoginCredentials = components['schemas']['LoginRequestDto'];
type RegisterData = components['schemas']['RegisterRequestDto'];
type LoginErrorCode = components['schemas']['LoginErrorCode'];
type RegisterErrorCode = components['schemas']['RegisterErrorCode'];
type MeErrorCode = components['schemas']['AuthErrorCode'] | components['schemas']['UserErrorCode'];
type QueryError = {
  message: string;
  data?: { code?: MeErrorCode; message?: string | null };
  status?: number;
  response?: { status?: number };
};

// Context Type
interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (registrationData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_TOKEN_KEY = 'authToken';
const ERROR_TIMEOUT_MS = 3000;

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const router = useRouter();
  const { t: tLoginError } = useLoginErrorTranslations();
  const { t: tRegisterError } = useRegisterErrorTranslations();
  const { t: tMeError } = useMeErrorTranslations();

  // Mutations
  const loginMutation = $api.useMutation('post', '/api/auth/login');
  const registerMutation = $api.useMutation('post', '/api/auth/register');

  // Query for user data
  const {
    data: meData,
    error: meQueryError,
    isLoading: isMeLoading,
    isError: isMeError,
  } = $api.useQuery(
    'get',
    '/api/auth/me',
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    {
      enabled: !!token && !isInitializing,
      retry: (failureCount, error: unknown) => {
        const hookError = error as QueryError;
        const status = hookError?.status ?? hookError?.response?.status;
        const errorCode = hookError?.data?.code;
        if (
          status === 401 ||
          status === 404 ||
          errorCode === 'INVALID_TOKEN' ||
          errorCode === 'EXPIRED_TOKEN' ||
          errorCode === 'USER_NOT_FOUND'
        ) {
          return false;
        }
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000,
    }
  );

  // --- useEffect for Auto-Clearing Error ---
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (error) {
      timerId = setTimeout(() => {
        setError(null);
      }, ERROR_TIMEOUT_MS);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [error]);

  // --- useEffect for Initialization ---
  useEffect(() => {
    const initializeAuth = async () => {
      setIsInitializing(true);
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        setToken(storedToken); // Set state first
        console.log(`Initialization: Found token in storage? ${!!storedToken}`);
        if (!storedToken) {
          setUser(null);
          setError(null);
        }
      } catch (e) {
        console.error('Failed to initialize auth:', e);
        setError('Failed to load session.');
        setToken(null);
        setUser(null);
      } finally {
        setTimeout(() => setIsInitializing(false), 50);
      }
    };
    initializeAuth();
  }, []); // Run only once on mount

  // --- useEffect to Update State based on /me Query Results ---
  useEffect(() => {
    if (!isInitializing) {
      if (isMeLoading) {
        /* Handled by combinedIsLoading */
      } else if (isMeError && meQueryError) {
        const hookError = meQueryError as QueryError;
        const status = hookError?.status ?? hookError?.response?.status;
        const errorCode = hookError?.data?.code;
        const apiMessage = hookError?.data?.message;
        const errorMessage = errorCode
          ? tMeError(errorCode)
          : apiMessage || hookError?.message || 'Failed to load user details.';
        console.error('Error fetching /me:', {
          status,
          errorCode,
          apiMessage,
          hookMessage: hookError?.message,
        });
        setError(errorMessage);
        setUser(null);
        if (
          status === 401 ||
          status === 404 ||
          errorCode === 'INVALID_TOKEN' ||
          errorCode === 'EXPIRED_TOKEN' ||
          errorCode === 'USER_NOT_FOUND'
        ) {
          console.log('Auth error on /me fetch, clearing token state and storage.');
          setToken(null);
          AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        }
      } else if (meData) {
        setUser(meData);
        setError(null);
      } else if (!token) {
        // If token became null
        setUser(null);
        setError(null);
      }
    }
  }, [isInitializing, isMeLoading, isMeError, meQueryError, meData, token, tMeError]);

  // --- login function ---
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setError(null);
      try {
        const data = await loginMutation.mutateAsync({ body: credentials });
        if (data?.token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
          setToken(data.token);
          setUser(data);
          router.replace('/auth/profile');
        } else {
          throw new Error('Login response did not contain a token.');
        }
      } catch (err: unknown) {
        const apiError = err as ApiError<LoginErrorCode> & { status?: number };
        const errorCode = apiError.data?.code;
        setError(errorCode ? tLoginError(errorCode) : 'Login failed. Please try again.');
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      }
    },
    [loginMutation, router, tLoginError]
  );

  // --- register function ---
  const register = useCallback(
    async (registrationData: RegisterData) => {
      setError(null);
      try {
        const data = await registerMutation.mutateAsync({ body: registrationData });
        if (data?.token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
          setToken(data.token);
          setUser(data);
          router.replace('/auth/profile');
        } else {
          throw new Error('Registration completed but no token received.');
        }
      } catch (err: unknown) {
        const anyError = err as any;
        const errorData = anyError?.data ?? anyError?.error?.data;
        const errorCode = errorData?.code as RegisterErrorCode | undefined;
        const backendMessage = errorData?.message ?? anyError?.message;
        const displayMessage = errorCode
          ? tRegisterError(errorCode)
          : backendMessage || 'Registration failed. Please try again.';
        setError(displayMessage);
        setToken(null);
        setUser(null);
      }
    },
    [registerMutation, router, tRegisterError]
  );

  // --- logout function ---
  const logout = useCallback(async () => {
    setError(null);
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    router.replace('/');
  }, [router]);

  // Combined loading state
  const combinedIsLoading = isMeLoading || loginMutation.isPending || registerMutation.isPending;

  // Context value
  const value: AuthContextType = {
    token,
    user,
    login,
    register,
    logout,
    isLoading: !isInitializing && combinedIsLoading,
    isInitializing,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
