import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import LanguageSelect from '@/src/components/LanguageSelect';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { Text } from '@/src/components/ui/text';
import { loadInlineTranslations } from '@/src/lib/loadInlineTranslations';

const NAMESPACE = 'app/(tabs)/index';
const TRANSLATIONS = {
  en: {
    welcome: 'Welcome',
    greeting: 'Hello, {{name}}!',
    age: 'You are {{age}} years old.',
  },
  pl: {
    welcome: 'Witaj',
    greeting: 'Cześć, {{name}}!',
    age: 'Masz {{age}} lat.',
  },
};
loadInlineTranslations(NAMESPACE, TRANSLATIONS);

export default function App() {
  const { t } = useTranslation(NAMESPACE);

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text>{t('welcome')}</Text>
      <Text>{t('greeting', { name: 'John' })}</Text>
      <Text>{t('age', { age: 20 })}</Text>
      <ThemeToggle className="mt-4 p-2" />
      <LanguageSelect className="mt-4" />
    </SafeAreaView>
  );
}
