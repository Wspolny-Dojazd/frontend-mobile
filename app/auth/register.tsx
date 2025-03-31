import { Link } from 'expo-router';
import { Lock, UserRound, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/button'; // Assuming path
import { InputText } from '@/src/components/ui/inputText'; // Assuming path
import { Text } from '@/src/components/ui/text'; // Assuming path
import { useAuth } from '@/src/context/authContext';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/auth/register';
const TRANSLATIONS = {
  en: {
    register: 'Create Account',
    nickname: 'Nickname',
    email: 'Email address',
    password: 'Password',
    registerButton: 'Register',
    loginPrompt: 'Already have an account?',
    loginLink: 'Login here',
    registering: 'Registering...',
  },
  pl: {
    register: 'Utwórz konto',
    nickname: 'Pseudonim',
    email: 'Adres email',
    password: 'Hasło',
    registerButton: 'Zarejestruj się',
    loginPrompt: 'Masz już konto?',
    loginLink: 'Zaloguj się',
    registering: 'Rejestrowanie...',
  },
};

export default function Register() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error } = useAuth(); // Use context

  const handleRegister = () => {
     if (!nickname.trim() || !email.trim() || !password.trim()) {
       console.warn('Nickname, Email and password are required');
       return;
    }
    register({ nickname: nickname.trim(), email: email.trim(), password }); // Call context action
  };

  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between bg-background px-8">
      <View className="mt-16 flex w-full flex-1 items-center">
        <Text className="mb-12 text-4xl font-bold text-foreground">{t('register')}</Text>

        {/* Display Error from Context */}
        {error && (
          <View className="mb-4 w-full rounded border border-destructive bg-destructive/10 p-3">
            <Text className="text-center font-semibold text-destructive">{error}</Text>
          </View>
        )}

        {/* Nickname Input */}
        <View className="relative mb-6 w-full">
          <InputText
            placeholder={t('nickname')}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            className="rounded-lg bg-input py-3 pl-12 text-foreground"
            placeholderTextColor="text-muted-foreground"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <UserRound size={20} strokeWidth={2.5} color="#909597" />
          </View>
        </View>

        {/* Email Input */}
        <View className="relative mb-6 w-full">
          <InputText
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            className="rounded-lg bg-input py-3 pl-12 text-foreground"
            placeholderTextColor="text-muted-foreground"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Mail size={20} strokeWidth={2.5} color="#909597" />
          </View>
        </View>

        {/* Password Input */}
        <View className="relative mb-8 w-full">
          <InputText
            placeholder={t('password')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoComplete="new-password"
            className="w-full rounded-lg bg-input py-3 pl-12 text-foreground"
            placeholderTextColor="text-muted-foreground"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Lock size={20} strokeWidth={2.5} color="#909597" />
          </View>
        </View>
      </View>

      {/* Login Link */}
      <View className="mb-4 items-center justify-center">
        <Text className="text-muted-foreground">{t('loginPrompt')} </Text>
        <Link href="/auth/login" asChild>
          <Text className="font-semibold text-white">{t('loginLink')}</Text>
        </Link>
      </View>

      {/* Submit Button */}
      <Button
        onPress={handleRegister}
        disabled={isLoading}
        className="mb-6 w-full rounded-lg bg-primary py-3"
      >
        {isLoading ? (
          <View className="flex-row items-center justify-center">
             <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
             <Text className="text-lg font-semibold text-primary-foreground">{t('registering')}</Text>
           </View>
        ) : (
          <Text className="text-lg font-semibold text-white">{t('registerButton')}</Text>
        )}
      </Button>
    </SafeAreaView>
  );
}
