// app/auth/profile.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native'; // Removed unused Pressable, Alert
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
// Removed Clipboard import

import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/context/authContext';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/auth/profile';

// Updated TRANSLATIONS (removed clipboard keys, added notLoggedIn)
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
  },
};
// --- End TRANSLATIONS Update ---

export default function AuthProfileScreen() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  // Destructure token from useAuth
  const { user, logout, isLoading, isInitializing, error, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
      // This effect tries to redirect away if not logged in after init
      if (!isInitializing && !user) {
          // console.log("AuthProfile: No user after init, redirecting to /"); // Keep for debug
          router.replace('/');
        }
    }, [isInitializing, user, router]);

  // Removed copyTokenToClipboard function

  // Loading state
  if (isInitializing || (isLoading && !user && token)) { // Check token to differentiate initial load from failed load after login attempt
     return (
       <SafeAreaView className="flex-1 items-center justify-center bg-background">
         <ActivityIndicator size="large" />
         <Text className="mt-4 text-muted-foreground">{t('loadingUser')}</Text>
       </SafeAreaView>
     );
   }

   // No user state after load check is complete
   if (!isInitializing && !user) {
     return (
       <SafeAreaView className="flex-1 items-center justify-center bg-background p-8">
         <Text className="text-xl text-muted-foreground">{t('notLoggedIn')}</Text>
         <Link href="/" className="mt-4">
            <Text className="text-primary underline">Go to Home</Text>
         </Link>
       </SafeAreaView>
     );
   }

  // Main content - Only renders if !isInitializing and user exists
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 32, alignItems: 'center' }}>

        <Text className="mb-10 text-3xl font-bold text-foreground">{t('profileTitle')}</Text>

        {/* Display user info only if user definitely exists */}
        {user && (
          <>
            <View className="w-full items-start space-y-4 mb-6">
                <Text className="text-xl text-foreground">{t('welcome', { nickname: user.nickname })}</Text>
                <Text className="text-base text-muted-foreground">{t('email', { email: user.email })}</Text>
                <Text className="text-base text-muted-foreground">{t('userId', { id: user.id })}</Text>
            </View>

            <View className="w-full items-start space-y-2 mb-6 border-t border-border pt-4">
                <Text className="text-lg font-semibold text-foreground">{t('jwtToken')}</Text>
                {token ? (
                    <Text selectable className="text-xs text-muted-foreground break-all bg-muted p-2 rounded">
                        {token}
                    </Text>
                ) : (
                    <Text className="text-sm text-muted-foreground italic">No token available</Text>
                )}
                {/* Removed Copy Button */}
            </View>

            <View className="w-full my-4">
               <Link href="/tabs" asChild>
                   <Button variant="outline" className="w-full">
                      <Text>{t('goToTabs')}</Text>
                   </Button>
               </Link>
            </View>

            <View className="w-full mt-8">
              <Button onPress={logout} disabled={isLoading} className="w-full rounded-lg bg-destructive py-3">
                <Text className="text-lg font-semibold text-destructive-foreground">{t('logoutButton')}</Text>
              </Button>
            </View>
          </>
        )}
        {/* End conditional user block */}

      </ScrollView>
    </SafeAreaView>
  );
}
