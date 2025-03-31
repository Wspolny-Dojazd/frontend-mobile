import { useRouter } from 'expo-router';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { ChevronLeft } from '@/src/lib/icons/ChevronLeft';

export default function App() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <View className="mt-2 flex-1 items-center justify-start">
        <Input
          placeholder="Gdzie się wybierasz..."
          containerClassName="bg-gray-50 border-0 mx-3"
          leftSection={<ChevronLeft size={20} color="gray" />}
        />
        <Pressable onPress={() => router.replace('/tabs?')}>
          <Text>Close</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
