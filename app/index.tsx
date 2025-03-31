// app/index.tsx
// @ts-expect-error - Acknowledge potential SVG import issue if bundler isn't configured
import Logo from 'assets/logo.svg'; // Assuming path is correct
import { Link } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TextLanguageSelect from '@/src/components/TextLanguageSelect'; // Assuming path is correct
import { Text } from '@/src/components/ui/text'; // Assuming path is correct
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations'; // Assuming path is correct

const NAMESPACE = 'index';
const TRANSLATIONS = {
  en: {
    description: 'Travel together with friends without worrying if you will get on the same bus.',
    signup: 'Sign up',
    signin: 'Sign in',
  },
  pl: {
    description:
      'Podróżuj razem ze znajomymi bez zastanawiania się, czy na pewno wsądziecie w ten sam autobus.',
    signup: 'Dołącz',
    signin: 'Zaloguj się',
  },
};

export default function App() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);

  return (
    // Ensure root uses bg-background or similar theme-aware class if needed
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8 bg-background">
      <View className="flex w-full flex-1 items-center justify-center">
        {/* Ensure Logo component handles potential errors or provide fallback */}
        <Logo width={100} height={100} />

        <Text className="my-8 text-4xl font-normal">Wspólny dojazd</Text>
        <Text className="text-center text-base">{t('description')}</Text>

        {/* Link styled as Sign up Button */}
        <Link
          href="/auth/register" // Navigates to register screen handled by 'auth' container
          className="mt-12 w-full rounded-2xl bg-primary py-3 text-center">
          {/* Ensure Text component inherits styles or apply directly */}
          <Text className="text-lg text-white">{t('signup')}</Text>
        </Link>

        {/* Link styled as Sign in Button */}
        <Link href="/auth/login" // Navigates to login screen handled by 'auth' container
          className="mt-6 w-full rounded-2xl bg-subtle py-3 text-center">
          <Text className="text-lg text-primary">{t('signin')}</Text>
        </Link>
      </View>

      {/* Language Selector Component */}
      <TextLanguageSelect className="mb-4" />

      {/* Debug Link targeting the 'tabs' screen name */}
      <Link href="/tabs" className="mb-4 dark:text-white">
        (DEBUG) Go to tabs container
      </Link>
    </SafeAreaView>
  );
}
