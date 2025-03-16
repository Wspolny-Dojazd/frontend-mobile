import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import LanguageSelect from '@/src/components/LanguageSelect';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/(tabs)/index';
const TRANSLATIONS = {
  en: {
    welcome: 'Welcome',
    greeting: 'Hello, {{name}}!',
    age: 'You are {{age}} years old.',
    nested: {
      key: 'Nested key',
    },
    double: {
      nested: {
        key: 'Nested key 2',
      },
    },
  },
  pl: {
    welcome: 'Witaj',
    greeting: 'Cześć, {{name}}!',
    age: 'Masz {{age}} lat.',
    nested: {
      key: 'Zagnieżdżony klucz',
    },
    double: {
      nested: {
        key: 'Zagnieżdżony klucz 2',
      },
    },
  },
};

export default function App() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text>{t('welcome')}</Text>
      <Text>{t('greeting', { name: 'John' })}</Text>
      <Text>{t('age', { age: 20 })}</Text>
      <Text>{t('nested.key')}</Text>
      <Text>{t('double.nested.key')}</Text>

      <ThemeToggle className="mt-4 p-2" />
      <LanguageSelect className="mt-4" />

      <Link href="/auth/login" className="mt-4 rounded-md border border-gray-300 p-2">
        <Text>Login</Text>
      </Link>
      <Link href="/auth/register" className="mt-4 rounded-md border border-gray-300 p-2">
        <Text>Register</Text>
      </Link>
    </SafeAreaView>
  );
}
