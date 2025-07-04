import { Link, useRouter } from 'expo-router';
import { Lock, UserRound, Mail } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRegisterErrorTranslations } from '@/src/api/errors/auth/register';
import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/context/authContext';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { validatePasswordWithMessages } from '@/src/utils/passwordValidation';

const NAMESPACE = 'app/auth/register';
const REDIRECT_DELAY_MS = 2500;

const TRANSLATIONS = {
  en: {
    register: 'Create Account',
    username: 'Username *',
    nickname: 'Display name *',
    email: 'Email address *',
    password: 'Password *',
    registerButton: 'Register',
    loginPrompt: 'Already have an account?',
    loginLink: 'Login here',
    registering: 'Registering...',
    loggedInRedirect: 'Already logged in. Redirecting to profile...',
    passwordRequirements:
      'Password must be at least 8 characters with 1 uppercase letter, 1 number, and 1 special character',
    passwordTooShort: 'Password must be at least 8 characters long',
    passwordMissingUppercase: 'Password must contain at least one uppercase letter',
    passwordMissingNumber: 'Password must contain at least one number',
    passwordMissingSpecialChar: 'Password must contain at least one special character',
    fillAllFields: 'Please fill in all fields',
  },
  pl: {
    register: 'Utwórz konto',
    username: 'Nazwa użytkownika *',
    nickname: 'Nazwa wyświetlana *',
    email: 'Adres email *',
    password: 'Hasło *',
    registerButton: 'Zarejestruj się',
    loginPrompt: 'Masz już konto?',
    loginLink: 'Zaloguj się',
    registering: 'Rejestrowanie...',
    loggedInRedirect: 'Jesteś już zalogowany. Przekierowanie do profilu...',
    passwordRequirements:
      'Hasło musi mieć co najmniej 8 znaków, w tym przynajmniej 1 wielką literą, 1 cyfrę i 1 znak specjalny',
    passwordTooShort: 'Hasło musi mieć co najmniej 8 znaków',
    passwordMissingUppercase: 'Hasło musi zawierać co najmniej jedną wielką literę',
    passwordMissingNumber: 'Hasło musi zawierać co najmniej jedną cyfrę',
    passwordMissingSpecialChar: 'Hasło musi zawierać co najmniej jeden znak specjalny',
    fillAllFields: 'Proszę wypełnić wszystkie pola',
  },
};

export default function Register() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const { t: tError } = useRegisterErrorTranslations();
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { register, isLoading, error: authError, token, isInitializing } = useAuth();
  const router = useRouter();
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [registerSucceeded, setRegisterSucceeded] = useState(false);

  useEffect(() => {
    // Clear previous timer
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);

    const shouldRedirect = !isInitializing && hasSubmitted && token && !authError && !isLoading;

    if (shouldRedirect) {
      setRegisterSucceeded(true);
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

  const validateForm = () => {
    const errors: string[] = [];

    // Check if all fields are filled
    if (!username.trim() || !nickname.trim() || !email.trim() || !password.trim()) {
      errors.push(t('fillAllFields'));
      setValidationErrors(errors);
      return false;
    }

    // Validate password
    const passwordValidation = validatePasswordWithMessages(password, {
      tooShort: t('passwordTooShort'),
      missingUppercase: t('passwordMissingUppercase'),
      missingNumber: t('passwordMissingNumber'),
      missingSpecialChar: t('passwordMissingSpecialChar'),
    });
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleRegister = () => {
    if (!validateForm()) return;

    setHasSubmitted(true);
    setRegisterSucceeded(false);
    register({
      username: username.trim(),
      nickname: nickname.trim(),
      email: email.trim(),
      password,
    });
  };

  const iconPaddingClass = 'ps-[14px]';

  if (registerSucceeded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-8">
        <ActivityIndicator size="large" className="mb-4" />
        <Text className="text-center text-lg text-muted-foreground">{t('loggedInRedirect')}</Text>
      </SafeAreaView>
    );
  }

  // Render the normal register form if not redirecting
  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between bg-background px-8">
      <ScrollView
        className="w-full"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled">
        <View className="mt-16 flex w-full flex-1 items-center">
          <Text className="mb-12 text-4xl font-bold text-foreground">{t('register')}</Text>

          {authError && !isLoading && (
            <View className="mb-4 w-full rounded border border-destructive bg-destructive/10 p-3">
              <Text className="text-center font-semibold text-destructive">{authError}</Text>
            </View>
          )}

          {validationErrors.length > 0 && (
            <View className="mb-4 w-full rounded border border-destructive bg-destructive/10 p-3">
              {validationErrors.map((error, index) => (
                <Text key={index} className="text-center font-semibold text-destructive">
                  {error}
                </Text>
              ))}
            </View>
          )}

          {/* Username Input*/}
          <View className="relative mb-6 w-full">
            <InputText
              placeholder={t('username')}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              className="rounded-2xl py-3 pl-12 text-black"
              placeholderTextColor="text-muted-foreground"
              editable={!isLoading}
            />
            <View
              className={`pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ${iconPaddingClass}`}>
              <UserRound size={24} strokeWidth={3} color="#909597" />
            </View>
          </View>

          {/* Nickname Input*/}
          <View className="relative mb-6 w-full">
            <InputText
              placeholder={t('nickname')}
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
              className="rounded-2xl py-3 pl-12 text-black"
              placeholderTextColor="text-muted-foreground"
              editable={!isLoading}
            />
            <View
              className={`pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ${iconPaddingClass}`}>
              <UserRound size={24} strokeWidth={3} color="#909597" />
            </View>
          </View>

          {/* Email Input*/}
          <View className="relative mb-6 w-full">
            <InputText
              placeholder={t('email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="rounded-2xl py-3 pl-12 text-black"
              placeholderTextColor="text-muted-foreground"
              editable={!isLoading}
            />
            <View
              className={`pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ${iconPaddingClass}`}>
              <Mail size={24} strokeWidth={3} color="#909597" />
            </View>
          </View>

          {/* Password Input*/}
          <View className="relative mb-2 w-full">
            <InputText
              placeholder={t('password')}
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                // Clear validation errors when user starts typing
                if (validationErrors.length > 0) {
                  setValidationErrors([]);
                }
              }}
              autoComplete="new-password"
              className="w-full rounded-2xl bg-field py-3 pl-12 text-black"
              placeholderTextColor="text-muted-foreground"
              editable={!isLoading}
            />
            <View
              className={`pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ${iconPaddingClass}`}>
              <Lock size={24} strokeWidth={3} color="#909597" />
            </View>
          </View>

          {/* Password Requirements */}
          <View className="mb-8 w-full">
            <Text className="text-center text-xs text-muted-foreground">
              {t('passwordRequirements')}
            </Text>
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
          className="mb-6 w-full rounded-2xl bg-primary py-3">
          {isLoading ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
              <Text className="text-lg font-semibold text-white">{t('registering')}</Text>
            </View>
          ) : (
            <Text className="text-lg font-semibold text-white">{t('registerButton')}</Text>
          )}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
