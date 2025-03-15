import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';

export default function Register() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold">Register</Text>

      <View className="mt-4 w-full gap-4">
        <InputText placeholder="Email" value={email} onChangeText={setEmail} />
        <InputText placeholder="Nickname" value={nickname} onChangeText={setNickname} />
        <InputText
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <InputText
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <Button onPress={() => {}}>
          <Text>Register</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
