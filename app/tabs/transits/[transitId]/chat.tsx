import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/tabs/transits/[transitId]';
const TRANSLATIONS = {
  en: {},
  pl: {},
};

export default function App() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);

  return (
    <SafeAreaView className="relative flex-1 p-4">
      <Text>Chat</Text>
    </SafeAreaView>
  );
}
