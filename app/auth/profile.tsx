import { useRouter, Link } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/context/authContext';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/auth/profile';
const REDIRECT_DELAY_MS = 1500; // 2.5 seconds delay

const TRANSLATIONS = {
  en: {
    profileTitle: 'User Profile (Auth)',
    welcome: 'Welcome, {{nickname}}!',
    email: 'Email: {{email}}',
    userId: 'User ID: {{id}}',
    jwtToken: 'JWT Token:',
    logoutButton: 'Logout',
    loadingUser: 'Loading profile...',
    goToTabs: 'Go to Main App (Tabs)',
    notLoggedIn: 'Not logged in.',
    redirecting: 'Redirecting soon...',
  },
  pl: {
    profileTitle: 'Profil Użytkownika (Auth)',
    welcome: 'Witaj, {{nickname}}!',
    email: 'Email: {{email}}',
    userId: 'ID Użytkownika: {{id}}',
    jwtToken: 'Token JWT:',
    logoutButton: 'Wyloguj',
    loadingUser: 'Ładowanie profilu...',
    goToTabs: 'Przejdź do aplikacji (Tabsy)',
    notLoggedIn: 'Nie zalogowano.',
    redirecting: 'Przekierowanie za chwilę...',
  },
};

export default function AuthProfileScreen() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const { user, logout, isLoading, isInitializing, token } = useAuth();
  const router = useRouter();
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null); // Ref to hold timer ID

  useEffect(() => {
    // Clear any existing timer on re-render or unmount
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    // Logic for redirecting when NOT logged in
    if (!isInitializing && !user && !token) {
      // Set a timer to redirect after the delay
      redirectTimerRef.current = setTimeout(() => {
        router.replace('/');
      }, REDIRECT_DELAY_MS);
    }

    // Cleanup function to clear timer if component unmounts or auth state changes
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [isInitializing, user, token, router]);

  // Loading state
  if (isInitializing || (isLoading && !user && token)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">{t('loadingUser')}</Text>
      </SafeAreaView>
    );
  }

  // No user state after load check AND initialization complete
  if (!isInitializing && !user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-8">
        <Text className="mb-2 text-xl text-destructive">{t('notLoggedIn')}</Text>
        <Text className="text-base text-muted-foreground">{t('redirecting')}</Text>
      </SafeAreaView>
    );
  }

  // Main content - Renders only if !isInitializing and user exists
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 32, alignItems: 'center' }}>
        <Text className="mb-10 text-3xl font-bold text-foreground">{t('profileTitle')}</Text>

        {user && (
          <>
            <View className="mb-6 w-full items-start space-y-4">
              <Text className="text-xl text-foreground">
                {t('welcome', { nickname: user.nickname })}
              </Text>
              <Text className="text-base text-muted-foreground">
                {t('email', { email: user.email })}
              </Text>
              <Text className="text-base text-muted-foreground">
                {t('userId', { id: user.id })}
              </Text>
            </View>

            <View className="mb-6 w-full items-start space-y-2 border-t border-border pt-4">
              <Text className="text-lg font-semibold text-foreground">{t('jwtToken')}</Text>
              {token ? (
                <Text
                  selectable
                  className="break-all rounded bg-muted p-2 text-xs text-muted-foreground">
                  {token}
                </Text>
              ) : (
                <Text className="text-sm italic text-muted-foreground">No token available</Text>
              )}
            </View>

            <View className="my-4 w-full">
              <Link href="/tabs" asChild>
                <Button variant="outline" className="w-full">
                  <Text>{t('goToTabs')}</Text>
                </Button>
              </Link>
            </View>

            <View className="mt-8 w-full">
              <Button
                onPress={logout}
                disabled={isLoading}
                className="w-full rounded-lg bg-destructive py-3">
                <Text className="text-lg font-semibold text-destructive-foreground">
                  {t('logoutButton')}
                </Text>
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
