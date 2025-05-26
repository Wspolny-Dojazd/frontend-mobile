import { Link, useRouter } from 'expo-router';
import { Lock, UserRound } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/context/authContext';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/auth/login';
const REDIRECT_DELAY_MS = 2500;

const TRANSLATIONS = {
  en: {
    login: 'Login',
    email: 'E-mail address',
    password: 'Password',
    loginButton: 'Login',
    recoverPassword: 'Forgot password?',
    loggingIn: 'Logging in...',
    registerPrompt: "Don't have an account?",
    registerLink: 'Register here',
    loggedInRedirect: 'Already logged in. Redirecting to profile...',
  },
  pl: {
    login: 'Logowanie',
    email: 'Adres email',
    password: 'Hasło',
    loginButton: 'Zaloguj się',
    recoverPassword: 'Zapomniałeś hasła?',
    loggingIn: 'Logowanie...',
    registerPrompt: 'Nie masz konta?',
    registerLink: 'Zarejestruj się',
    loggedInRedirect: 'Jesteś już zalogowany. Przekierowanie do profilu...',
  },
};

export default function Login() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error: authError, token, isInitializing } = useAuth();
  const router = useRouter();
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loginSucceeded, setLoginSucceeded] = useState(false);

  useEffect(() => {
    // Clear previous timer
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);

    const shouldRedirect = !isInitializing && hasSubmitted && token && !authError && !isLoading;

    if (shouldRedirect) {
      setLoginSucceeded(true);
      setHasSubmitted(false);
      redirectTimerRef.current = setTimeout(() => {
        router.replace('/tabs');
      }, REDIRECT_DELAY_MS);
    }

    // Cleanup timer on unmount or dependency change
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [isInitializing, hasSubmitted, token, authError, isLoading]);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) return;
    setHasSubmitted(true);
    setLoginSucceeded(false);
    login({ email: email.trim(), password: password.trim() });
  };

  if (loginSucceeded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-8">
        <ActivityIndicator size="large" className="mb-4" />
        <Text className="text-center text-lg text-muted-foreground">{t('loggedInRedirect')}</Text>
      </SafeAreaView>
    );
  }

  // Render the normal login form if not redirecting
  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8">
      {/* --- Main Content Area --- */}
      <View className="mt-20 flex w-full flex-1 items-center">
        <Text className="mb-28 text-4xl font-bold">{t('login')}</Text>

        {/* --- Error Display --- */}
        {authError && !isLoading && (
          <View className="mb-4 w-full rounded border border-destructive bg-destructive/10 p-2">
            <Text className="text-center font-medium text-destructive">{authError}</Text>
          </View>
        )}

        {/* --- Email Input --- */}
        <View className="relative mb-6 w-full">
          <InputText
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="pl-12 text-black"
            editable={!isLoading}
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <UserRound size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>

        {/* --- Password Input --- */}
        <View className="relative w-full">
          <InputText
            placeholder={t('password')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="pl-12 text-black"
            editable={!isLoading}
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <Lock size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>

        {/* --- Recover Password Link --- */}
        <View className="mt-4 w-full items-end">
          <Link href="/auth/recover">
            <Text className="font-semibold text-primary">{t('recoverPassword')}</Text>
          </Link>
        </View>
      </View>

      {/* --- Register Link --- */}
      <View className="mb-4 items-center justify-center">
        <Text className="text-muted-foreground">{t('registerPrompt')} </Text>
        <Link href="/auth/register" asChild>
          <Text className="font-semibold text-white">{t('registerLink')}</Text>
        </Link>
      </View>

      {/* --- Login Button --- */}
      <Button
        onPress={handleLogin}
        disabled={isLoading}
        className="mb-4 w-full rounded-2xl bg-primary py-3">
        {isLoading ? (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
            <Text className="text-lg font-semibold text-white">{t('loggingIn')}</Text>
          </View>
        ) : (
          <Text className="text-lg font-semibold text-white">{t('loginButton')}</Text>
        )}
      </Button>
    </SafeAreaView>
  );
}
