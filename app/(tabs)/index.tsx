import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

import LanguageSelect from '@/src/components/LanguageSelect';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import Svg from 'react-native-svg';

// @ts-expect-error
import Logo from 'assets/logo.svg';
import TextLanguageSelect from '@/src/components/TextLanguageSelect';

const NAMESPACE = 'app/(tabs)/index';
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
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8">
      <View className={'flex w-full flex-1 items-center justify-center'}>
        <Logo width={100} height={100} />

        <Text className="my-8 text-4xl font-normal">Wspólny dojazd</Text>
        <Text className="text-center text-base">{t('description')}</Text>

        <Link
          href="/auth/register"
          className="mt-12 w-full rounded-2xl bg-primary py-3 text-center">
          <Text className="text-lg text-white">{t('signup')}</Text>
        </Link>

        <Link href="/auth/login" className="bg-subtle mt-6 w-full rounded-2xl py-3 text-center">
          <Text className="text-lg text-primary">{t('signin')}</Text>
        </Link>
      </View>

      <TextLanguageSelect className="mb-4" />
    </SafeAreaView>
  );
}
