// @ts-expect-error
import Logo from 'assets/logo.svg';
import { Link } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TextLanguageSelect from '@/src/components/TextLanguageSelect';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

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

      {/* --- Debug Link --- */}
      <Link href="/tabs" className="mb-4 dark:text-white">
        (DEBUG) Go to tabs container
      </Link>
    </SafeAreaView>
  );
}
