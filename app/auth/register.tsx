import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/src/components/ui/text';
import { TextInput } from '@/src/components/ui/textInput';
import { Button } from '@/src/components/ui/button';
import { useState } from 'react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-4">
      <Text>Register</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Register" onPress={() => {}} />
    </SafeAreaView>
  );
}
