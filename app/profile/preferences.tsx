import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/src/components/ui/text';

export default function App() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text>Preferences</Text>
    </SafeAreaView>
  );
}
