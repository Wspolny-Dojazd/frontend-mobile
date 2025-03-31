// app/_layout.tsx
import '@/i18n';
import '@/global.css';

import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Use Slot, useRouter, useSegments
import { Slot, useRouter, useSegments, ErrorBoundary } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
// Import ActivityIndicator, View, StyleSheet, useColorScheme
import { Platform, useColorScheme as useRNColorScheme, ActivityIndicator, View, StyleSheet } from 'react-native';

// Import AuthProvider and useAuth hook
import { AuthProvider, useAuth } from '@/src/context/authContext'; // Adjust path if needed
import { NAV_THEME } from '@/src/lib/constants'; // Assuming NAV_THEME is defined for colors

// TODO: Make the client persistent if needed
const queryClient = new QueryClient();

// Define Themes based on NAV_THEME
const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: { // Ensure defaults are spread if NAV_THEME doesn't cover all keys
      ...DefaultTheme.colors,
      ...NAV_THEME.light
  },
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: { // Ensure defaults are spread if NAV_THEME doesn't cover all keys
    ...DarkTheme.colors,
    ...NAV_THEME.dark
  },
};

export { ErrorBoundary };


// --- Helper Component for Auth Redirection ---
function AuthRedirector() {
  const { token, isInitializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useRNColorScheme(); // Get color scheme for loader

  useEffect(() => {
    if (isInitializing) {
      return; // Wait for auth check
    }

    // Determine current location based on segments
    const inTabsGroup = segments[0] === '(tabs)';
    const inAuthGroup = segments[0] === '(auth)';
    const isAtAuthProfile = inAuthGroup && segments[1] === 'profile';
    const isAtRoot = segments.length === 0;


    // console.log(`Auth Redirect Check (Force Auth Profile): Init=${isInitializing}, Token=${!!token}, Tabs=${inTabsGroup}, Auth=${inAuthGroup}, AuthProfile=${isAtAuthProfile}, Root=${isAtRoot}, Segments=${JSON.stringify(segments)}`); // Keep for debugging

    // --- Redirection Logic ---

    if (!token && (inTabsGroup || isAtAuthProfile)) {
      // Rule 1: Logged OUT + trying to access Tabs OR Auth Profile -> Redirect to root index page
      // console.log('Redirecting logged-out user TO / (index page)...'); // Keep for debugging
      router.replace('/');

    } else if (token && (isAtRoot || (inAuthGroup && !isAtAuthProfile)) ) {
      // Rule 2: Logged IN + BUT NOT in Tabs group AND NOT on Auth Profile
      // (This means they are on root '/' or some other screen in auth group like /auth/login or /auth/register)
      // -> Redirect to Auth Profile
      // console.log('Redirecting logged-in user from outside tabs/profile TO /auth/profile...'); // Keep for debugging
      router.replace('/auth/profile');

    }
    // Allow other cases: Logged IN in Tabs, Logged IN on Auth Profile, Logged OUT on root/auth (excluding auth/profile)

  }, [token, segments, router, isInitializing]); // Re-run effect when these change

  if (isInitializing) {
    // Show loading indicator with themed background
    const isDark = colorScheme === 'dark';
    const loaderStyle = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDark ? NAV_THEME.dark.background : NAV_THEME.light.background,
        }
    });
    const indicatorColor = isDark ? NAV_THEME.dark.primary : NAV_THEME.light.primary;

    return (
      <View style={loaderStyle.container}>
        <ActivityIndicator size="large" color={indicatorColor} />
      </View>
    );
  }

  // Render the matched layout/screen determined by Expo Router
  return <Slot />;
}
// --- End AuthRedirector ---


// --- Main Root Layout Component ---
export default function RootLayout() {
  const colorScheme = useRNColorScheme(); // Get system theme
  const isDarkColorScheme = colorScheme === 'dark';

  // State and effect for handling web-specific layout/styling readiness (optional)
  const [isReadyToRender, setIsReadyToRender] = useState(Platform.OS !== 'web'); // Native is ready immediately
  const hasMounted = useRef(false);

  useEffect(() => {
    // Apply web background and set ready state only once on web
    if (Platform.OS === 'web' && !hasMounted.current) {
      // Ensure 'bg-background' CSS class provides the desired background color via CSS variables
      document.documentElement.classList.add('bg-background');
      setIsReadyToRender(true); // Set ready after applying web style
      hasMounted.current = true;
    } else if (Platform.OS !== 'web') {
        setIsReadyToRender(true); // Ensure native is marked ready
    }
  }, []); // Runs once on mount

  // Prevent rendering until ready (especially needed for web to apply styles)
  if (!isReadyToRender) {
    return null;
  }

  return (
    // Provider order matters
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <AuthProvider>
          {/* StatusBar style reacts to theme */}
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
          {/* AuthRedirector handles loading/redirects before rendering Slot */}
          <AuthRedirector />
          {/* PortalHost for modals etc. */}
          <PortalHost />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
