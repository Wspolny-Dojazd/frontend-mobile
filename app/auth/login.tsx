import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/src/components/ui/text';
import { TextInput } from '@/src/components/ui/textInput';
import { Button } from '@/src/components/ui/button';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-4">
      <Text>Login</Text>
      <TextInput
        className="mb-2 w-full border p-2"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="mb-4 w-full border p-2"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={() => {}} />
    </SafeAreaView>
  );
}
