import '@/i18n';
import '@/global.css';

import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  useColorScheme as useRNColorScheme,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from '@/src/context/authContext';
import { NAV_THEME } from '@/src/lib/constants';
import { useColorScheme } from '@/src/lib/useColorScheme';

const queryClient = new QueryClient();

const LIGHT_THEME: Theme = { ...DefaultTheme, colors: NAV_THEME.light };
const DARK_THEME: Theme = { ...DarkTheme, colors: NAV_THEME.dark };

export { ErrorBoundary } from 'expo-router';

const PROFILE_REDIRECT_DELAY_MS = 2500; // Delay for redirecting from profile when logged out

// --- Helper Component for Auth Redirection ---
function AuthRedirector() {
  const { token, isInitializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const systemColorScheme = useRNColorScheme();
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    if (isInitializing) return;

    const currentRoute = segments.join('/');
    const inTabsGroup = segments[0] === '(tabs)';
    const isAtAuthProfile = currentRoute === 'auth/profile';

    // --- Simplified Redirection Logic ---
    if (!token && (inTabsGroup || isAtAuthProfile)) {
      // Rule: Logged OUT + trying to access protected areas

      if (isAtAuthProfile) {
        // Special Case: Delay redirect *from* profile page
        console.log(
          `AuthRedirector: Setting ${PROFILE_REDIRECT_DELAY_MS}ms delay for redirect from /auth/profile`
        );
        redirectTimerRef.current = setTimeout(() => {
          console.log(
            `AuthRedirector Action (Delayed): Redirecting logged OUT user from '/auth/profile' to '/'`
          );
          router.replace('/');
        }, PROFILE_REDIRECT_DELAY_MS);
      } else {
        // Immediate redirect for other protected areas (like /tabs)
        console.log(
          `AuthRedirector Action (Immediate): Redirecting logged OUT user from '/${currentRoute}' to '/'`
        );
        router.replace('/');
      }
    }

    // Cleanup timer
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [token, segments, router, isInitializing]);

  if (isInitializing) {
    const isDark = systemColorScheme === 'dark';
    const loaderStyle = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? NAV_THEME.dark.background : NAV_THEME.light.background,
      },
    });
    const indicatorColor = isDark ? NAV_THEME.dark.primary : NAV_THEME.light.primary;
    return (
      <View style={loaderStyle.container}>
        <ActivityIndicator size="large" color={indicatorColor} />
      </View>
    );
  }

  return <Slot />;
}
// --- End AuthRedirector ---

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <AuthProvider>
            <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
            <AuthRedirector />
            {/* <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="tabs" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="map-test" options={{ headerShown: false }} />
                <Stack.Screen name="search-place" options={{ headerShown: false }} />
                <Stack.Screen name="add-friends" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
              </Stack> */}
            {/* </AuthRedirector> */}
            <PortalHost />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
