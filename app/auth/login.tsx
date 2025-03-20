import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { Lock, UserRound } from 'lucide-react-native';
import Svg from 'react-native-svg';

const NAMESPACE = 'app/auth/login';
const TRANSLATIONS = {
  en: {
    login: 'Login',
    email: 'Username or email address',
    password: 'Password',
    loginButton: 'Login',
    recoverPassword: 'Forgot password?',
  },
  pl: {
    login: 'Logowanie',
    email: 'Nazwa użytkownika lub adres email',
    password: 'Hasło',
    loginButton: 'Zaloguj się',
    recoverPassword: 'Zapomniałeś hasła?',
  },
};

export default function Login() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8">
      <View className="mt-20 flex w-full flex-1 items-center">
        <Text className="mb-28 text-4xl font-bold">{t('login')}</Text>
        <View className="relative w-full">
          <InputText
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            className="bg-field mb-12 rounded-2xl pl-12"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <UserRound size={24} strokeWidth={3} color={'#909597'} />
          </View>
        </View>
        <View className="relative w-full">
          <InputText
            placeholder={t('password')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="bg-field w-full rounded-2xl pl-12"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <Lock size={24} strokeWidth={3} color={'#909597'} />
          </View>
        </View>

        <Text className="mt-4 w-full text-right text-primary">{t('recoverPassword')}</Text>
      </View>

      <Button onPress={() => {}} className="mb-4 w-full rounded-2xl bg-primary py-2 text-center">
        <Text className="text-lg font-semibold">{t('loginButton')}</Text>
      </Button>
    </SafeAreaView>
  );
}
