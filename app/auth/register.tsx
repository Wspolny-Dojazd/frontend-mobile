import { Lock, UserRound, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/auth/register';
const TRANSLATIONS = {
  en: {
    createAccount: 'Create account',
    joinApp: 'Join to our app',
    userName: 'User name',
    email: 'Email address',
    password: 'Password',
    passwordRe: 'Repeat password',
    accept: 'Accept terms and conditions',
    createButton: 'Create account',
  },
  pl: {
    createAccount: 'Załóż konto',
    joinApp: 'Dołącz do naszej aplikacji',
    userName: 'Nazwa użytkownika',
    email: 'Adres email',
    password: 'Hasło',
    passwordRe: 'Powtórz hasło',
    accept: 'Akceptuje regulamin',
    createButton: 'Utwórz konto',
  },
};
export default function Register() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accept, setAccept] = useState(false);

  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8">
      <View className="mt-20 flex w-full flex-1 items-center">
        <Text className="mb-10 text-4xl font-bold">{t('createAccount')}</Text>
        <Text className="mb-10 text-xl">{t('joinApp')}</Text>
        <View className="relative w-full">
          <InputText
            placeholder={t('userName')}
            value={userName}
            onChangeText={setUserName}
            className="mb-12 rounded-2xl bg-field pl-12"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <UserRound size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>
        <View className="relative w-full">
          <InputText
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            className="mb-12 rounded-2xl bg-field pl-12"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <Mail size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>
        <View className="relative w-full">
          <InputText
            placeholder={t('password')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="mb-12 rounded-2xl bg-field pl-12"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <Lock size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>
        <View className="relative w-full">
          <InputText
            placeholder={t('passwordRe')}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            className="w-full rounded-2xl bg-field pl-12"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <Lock size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>
        <View className="mt-10 w-full flex-row items-center">
          <Checkbox checked={accept} onCheckedChange={setAccept} />
          <Text className="ml-4 text-primary">{t('accept')}</Text>
        </View>
      </View>
      <Button onPress={() => {}} className="mb-4 w-full rounded-2xl bg-primary py-2 text-center">
        <Text className="text-lg font-semibold">{t('createButton')}</Text>
      </Button>
    </SafeAreaView>
  );
}
