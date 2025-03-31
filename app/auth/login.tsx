// app/auth/login.tsx
import { Link } from 'expo-router'; // Keep using Link
import { Lock, UserRound } from 'lucide-react-native';
import React, { useState } from 'react'; // Add React import if needed
import { View, ActivityIndicator } from 'react-native'; // Import ActivityIndicator
import { SafeAreaView } from 'react-native-safe-area-context';

// Remove the direct $api import if login is fully handled by context
// import { $api } from '@/src/api/api';
import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
// Import the useAuth hook
import { useAuth } from '@/src/context/authContext';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
// Keep error translation hooks if you plan to use them for *specific* error codes locally,
// though the main error message comes from the context now.
// import { useMeErrorTranslations } from '@/src/api/errors/auth/me';

const NAMESPACE = 'app/auth/login';
const TRANSLATIONS = {
  en: {
    login: 'Login',
    email: 'Username or email address', // Keep original text
    password: 'Password',
    loginButton: 'Login',
    recoverPassword: 'Forgot password?',
    loggingIn: 'Logging in...', // Add loading text
    // Error messages are now primarily handled by the context
  },
  pl: {
    login: 'Logowanie',
    email: 'Nazwa użytkownika lub adres email', // Keep original text
    password: 'Hasło',
    loginButton: 'Zaloguj się',
    recoverPassword: 'Zapomniałeś hasła?',
    loggingIn: 'Logowanie...', // Add loading text
  },
};

export default function Login() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Use Authentication Context ---
  const { login, isLoading, error: authError, user, token, isInitializing } = useAuth();
  // const { t: tMeError } = useMeErrorTranslations(); // Keep if needed for specific error codes

  // --- Remove Dummy Query ---
  // const queryUser = $api.useQuery('get', '/api/Auth/me');
  // Remove all logic related to queryUser.isLoading, queryUser.isError, etc.

  // --- Handle Login Action ---
  const handleLogin = () => {
    // Basic validation (optional)
    if (!email.trim() || !password.trim()) return;
    // Call the login function from the context
    login({ email: email.trim(), password });
  };

  return (
    // Keep existing SafeAreaView and className structure
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8">
      <View className="mt-20 flex w-full flex-1 items-center">
        <Text className="mb-28 text-4xl font-bold">{t('login')}</Text>

        {/* --- Display Error from Auth Context --- */}
        {authError && (
          <View className="mb-4 w-full rounded border border-destructive bg-destructive/10 p-2">
            {/* Style the error message appropriately */}
            <Text className="text-center font-medium text-destructive">{authError}</Text>
          </View>
        )}
        {/* --- End Error Display --- */}

        {/* Keep existing Input structure */}
        <View className="relative w-full">
          <InputText
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address" // Good practice
            autoCapitalize="none" // Good practice
            className="mb-12 rounded-2xl bg-field pl-12" // Keep existing style
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <UserRound size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>
        <View className="relative w-full">
          <InputText
            placeholder={t('password')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="w-full rounded-2xl bg-field pl-12" // Keep existing style
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <Lock size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>
        <View className="mt-4 w-full items-end">
          <Link href="/auth/recover">
            <Text className="text-primary">{t('recoverPassword')}</Text>
          </Link>
        </View>

        {/* --- Keep and Update Debug Section --- */}
        {/* Display relevant state from the Auth Context instead of queryUser */}
        <Text className="mt-5 text-xs">DEBUG:</Text>
        <Text className="text-xs">API URL: {process.env.EXPO_PUBLIC_API_URL}</Text>
        <Text className="text-xs">Token: {JSON.stringify(token)}</Text>
        <Text className="text-xs">User Data: {JSON.stringify(user)}</Text>
        <Text className="text-xs">Auth Error: {JSON.stringify(authError)}</Text>
        <Text className="text-xs">Is Loading (Auth): {JSON.stringify(isLoading)}</Text>
        <Text className="text-xs">Is Initializing (Auth): {JSON.stringify(isInitializing)}</Text>
        {/* --- End Debug Section --- */}

      </View>

      {/* Keep existing Button structure, update onPress and disabled state */}
      <Button
        onPress={handleLogin} // Call the context login action
        disabled={isLoading} // Disable based on context loading state
        className="mb-4 w-full rounded-2xl bg-primary py-2 text-center" // Keep existing style
      >
        {/* Show loading indicator or text */}
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
