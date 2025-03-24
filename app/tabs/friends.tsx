import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/src/components/ui/text';

export default function App() {
  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8">
      <Text>Znajomi</Text>
    </SafeAreaView>
  );
}
