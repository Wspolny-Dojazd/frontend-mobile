import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold">Login</Text>

      <View className="mt-4 w-full gap-4">
        <InputText placeholder="Email" value={email} onChangeText={setEmail} />
        <InputText
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button onPress={() => {}}>
          <Text>Login</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
