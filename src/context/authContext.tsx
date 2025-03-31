// src/context/authContext.tsx
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { $api, fetchClient } from '@/src/api/api';
import { components } from '@/src/api/openapi';
import { ApiError } from '@/src/api/errors/types';

import { useLoginErrorTranslations } from '@/src/api/errors/auth/login';
import { useRegisterErrorTranslations } from '@/src/api/errors/auth/register';
import { useMeErrorTranslations } from '@/src/api/errors/auth/me';

// Types
type User = components['schemas']['AuthResponseDto'];
type LoginCredentials = components['schemas']['LoginRequestDto'];
type RegisterData = components['schemas']['RegisterRequestDto'];
type LoginErrorCode = components['schemas']['LoginErrorCode'];
type RegisterErrorCode = components['schemas']['RegisterErrorCode'];
type MeErrorCode = components['schemas']['AuthErrorCode'] | components['schemas']['UserErrorCode'];

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
const ERROR_TIMEOUT_MS = 3000; // 3 seconds

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const router = useRouter();
  const { t: tLoginError } = useLoginErrorTranslations();
  const { t: tRegisterError } = useRegisterErrorTranslations();
  const { t: tMeError } = useMeErrorTranslations();

  // Mutations
  const loginMutation = $api.useMutation('post', '/api/Auth/login');
  const registerMutation = $api.useMutation('post', '/api/Auth/register');


  // --- useEffect for Auto-Clearing Error ---
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (error) {
      timerId = setTimeout(() => { setError(null); }, ERROR_TIMEOUT_MS);
    }
    return () => { if (timerId) { clearTimeout(timerId); } };
  }, [error]);
  // --- End useEffect ---


  // loadUser function (Corrected error handling)
  const loadUser = useCallback(async (currentToken: string) => {
    if (!currentToken) { setUser(null); return; }
    setIsLoading(true);
    let responseStatus: number | undefined;
    try {
      const { data, error: responseError, response } = await fetchClient.GET('/api/Auth/me', { headers: { Authorization: `Bearer ${currentToken}` } });
      responseStatus = response?.status;
      if (responseError && typeof responseError === 'object' && 'code' in responseError) {
          throw { message: responseError.message || 'Authorization failed', data: responseError, response: response, status: responseStatus } as ApiError<MeErrorCode> & { response?: Response };
      }
      if (responseError) { throw new Error("Network or server error occurred."); }
      if (data) { setUser(data); setError(null); } // Clear error on SUCCESS
      else { throw new Error("Failed to retrieve user data (empty response)."); }
    } catch (err: unknown) {
      const thrownError = err as ApiError<MeErrorCode> & { response?: Response; status?: number };
      const status = thrownError.status ?? thrownError.response?.status;
      const errorCode = thrownError.data?.code;
      const errorMessage = errorCode ? tMeError(errorCode) : (thrownError.message || 'Failed to load user details.');
      setError(errorMessage); // Set the error state
      if (status === 401 || status === 404 || errorCode === 'INVALID_TOKEN' || errorCode === 'EXPIRED_TOKEN' || errorCode === 'USER_NOT_FOUND') {
        setToken(null); setUser(null); await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      } else { setUser(null); } // Clear user on other errors too
    } finally { setIsLoading(false); }
  }, [tMeError]);

  // useEffect for initialization
  useEffect(() => {
    const initializeAuth = async () => {
      setIsInitializing(true);
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (storedToken) { setToken(storedToken); await loadUser(storedToken); } // Attempt load, might set error if expired
        else { setToken(null); setUser(null); setError(null); } // Clear error if no token found
      } catch (e) {
        console.error("Failed to initialize auth:", e); setError("Failed to load session.");
        setToken(null); setUser(null);
      } finally { setIsInitializing(false); }
    };
    initializeAuth();
  }, [loadUser]);

  // login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null); // Clear errors before attempting
    setIsLoading(true);
    try {
      const data = await loginMutation.mutateAsync({ body: credentials });
      if (data?.token) {
        setToken(data.token); setUser(data); await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        // console.log("AUTH_CONTEXT: Attempting redirect to /auth/profile after login"); // Keep for debug
        router.replace('/auth/profile'); // Target the profile screen within the (auth) group
      } else { throw new Error("Login response did not contain a token."); }
    } catch (err: unknown) {
      // console.error('Login error:', err); // Keep for debug
      const apiError = err as ApiError<LoginErrorCode>; const errorCode = apiError.data?.code;
      setError(errorCode ? tLoginError(errorCode) : 'Login failed. Please try again.');
      setToken(null); setUser(null); await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } finally { setIsLoading(false); }
  }, [loginMutation, router, tLoginError]);

  // register function
  const register = useCallback(async (registrationData: RegisterData) => {
    setError(null); // Clear errors before attempting
    setIsLoading(true);
    try {
      // console.log('REGISTER: Attempting registration with:', JSON.stringify(registrationData)); // Keep for debug
      const data = await registerMutation.mutateAsync({ body: registrationData });
      // console.log('REGISTER: Mutation success, API response:', JSON.stringify(data)); // Keep for debug
      if (data?.token) {
        setToken(data.token); setUser(data); await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        // console.log("AUTH_CONTEXT: Registration successful, attempting redirect to /auth/profile"); // Keep for debug
        router.replace('/auth/profile'); // Target the profile screen within the (auth) group
      } else { /* console.error("REGISTER: API success response missing token.", data); */ throw new Error("Registration completed but no token received."); }
    } catch (err: unknown) {
      // console.error('REGISTER: Caught error object during registration attempt:', JSON.stringify(err, null, 2)); // Keep for debug
      const anyError = err as any; const apiError = err as ApiError<RegisterErrorCode>; const httpStatus = anyError.status ?? anyError.response?.status; const errorData = apiError.data ?? anyError.data ?? anyError.error?.data; const errorCode = errorData?.code; const backendMessage = errorData?.message ?? anyError.message;
      // console.error(`REGISTER: Parsed Error details - Status: ${httpStatus}, Code: ${errorCode}, Backend Msg: ${backendMessage}`); // Keep for debug
      const displayMessage = errorCode ? tRegisterError(errorCode) : (backendMessage || 'Registration failed. Please try again.');
      // console.log(`REGISTER: Setting display error to: "${displayMessage}"`); // Keep for debug
      setError(displayMessage); // Set the user-facing error state
      setToken(null); setUser(null);
    } finally { setIsLoading(false); }
  }, [registerMutation, router, tRegisterError]);

  // logout function
  const logout = useCallback(async () => {
    setError(null); // Clear errors on logout action
    setToken(null); setUser(null); await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    // console.log("AUTH_CONTEXT: Attempting redirect to / after logout"); // Keep for debug
    router.replace('/'); // Redirect to the root index screen
  }, [router]);

  // Combined loading state
  const combinedIsLoading = isLoading || loginMutation.isPending || registerMutation.isPending;

  // Context value
  const value: AuthContextType = { token, user, login, register, logout, isLoading: combinedIsLoading, isInitializing, error };

  // Provide the context
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) { throw new Error('useAuth must be used within an AuthProvider'); }
  return context;
};
