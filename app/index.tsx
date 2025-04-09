// @ts-expect-error
import Logo from 'assets/logo.svg';
import { Link, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TextLanguageSelect from '@/src/components/TextLanguageSelect';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/context/authContext';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const REDIRECT_DELAY_MS = 2500; // Redirect delay duration

const NAMESPACE = 'index';
const TRANSLATIONS = {
  en: {
    description: 'Travel together with friends without worrying if you will get on the same bus.',
    signup: 'Sign up',
    signin: 'Sign in',
    loggedInRedirect: 'You are already logged in. Redirecting...',
  },
  pl: {
    description:
      'Podróżuj razem ze znajomymi bez zastanawiania się, czy na pewno wsądziecie w ten sam autobus.',
    signup: 'Dołącz',
    signin: 'Zaloguj się',
    loggedInRedirect: 'Jesteś już zalogowany. Przekierowanie...',
  },
};

export default function App() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);

  const { token, isInitializing } = useAuth();
  const router = useRouter();
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // TODO: There are at least two other places there similar logic is used. We need to refactor it.
  useLayoutEffect(() => {
    // Clear previous timer
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);

    // Redirect logic for logged-in users
    if (!isInitializing && token) {
      console.log('Login Screen: Detected logged-in user. Setting redirect timer.');
      setIsRedirecting(true);
      redirectTimerRef.current = setTimeout(() => {
        console.log('Login Screen: Redirect timer fired. Redirecting to /auth/profile.');
        // router.replace('/auth/profile');
        router.replace('/tabs');
      }, REDIRECT_DELAY_MS);
    } else {
      setIsRedirecting(false);
    }

    // Cleanup timer on unmount or dependency change
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [isInitializing, token, router]);

  // Show redirect message if applicable
  if (isRedirecting) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-8">
        <ActivityIndicator size="large" className="mb-4" />
        <Text className="text-center text-lg text-muted-foreground">{t('loggedInRedirect')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between bg-background px-8">
      {/* --- Main Content Area --- */}
      <View className="flex w-full flex-1 items-center justify-center">
        {/* --- Logo and Description --- */}
        <Logo width={100} height={100} />
        <Text className="my-8 text-4xl font-normal">Wspólny dojazd</Text>
        <Text className="text-center text-base">{t('description')}</Text>

        {/* --- Action Buttons --- */}
        <Link
          href="/auth/register"
          className="mt-12 w-full rounded-2xl bg-primary py-3 text-center">
          <Text className="text-lg text-white">{t('signup')}</Text>
        </Link>

        <Link href="/auth/login" className="mt-6 w-full rounded-2xl bg-subtle py-3 text-center">
          <Text className="text-lg text-primary">{t('signin')}</Text>
        </Link>
      </View>

      {/* --- Language Selector --- */}
      <TextLanguageSelect className="mb-4" />
    </SafeAreaView>
  );
}
