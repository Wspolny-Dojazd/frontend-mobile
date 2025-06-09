import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { $api } from '@/src/api/api';
import { useChangePasswordErrorTranslations } from '@/src/api/errors/auth/change-password';
import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/context/authContext';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { ChevronLeft } from '@/src/lib/icons';
import { validatePasswordWithMessages } from '@/src/utils/passwordValidation';

const NAMESPACE = 'app/auth/newPass';
const TRANSLATIONS = {
  en: {
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    save: 'Save Changes',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 8 characters long',
    passwordMissingUppercase: 'Password must contain at least one uppercase letter',
    passwordMissingNumber: 'Password must contain at least one number',
    passwordMissingSpecialChar: 'Password must contain at least one special character',
    passwordChanged: 'Password changed successfully!',
    fillAllFields: 'Please fill in all fields',
    passwordRequirements:
      'Password must be at least 8 characters with 1 uppercase letter, 1 number, and 1 special character',
  },
  pl: {
    changePassword: 'Zmień hasło',
    currentPassword: 'Aktualne hasło',
    newPassword: 'Nowe hasło',
    confirmPassword: 'Potwierdź nowe hasło',
    save: 'Zapisz zmiany',
    passwordsDoNotMatch: 'Hasła nie są identyczne',
    passwordTooShort: 'Hasło musi mieć co najmniej 8 znaków',
    passwordMissingUppercase: 'Hasło musi zawierać co najmniej jedną wielką literę',
    passwordMissingNumber: 'Hasło musi zawierać co najmniej jedną cyfrę',
    passwordMissingSpecialChar: 'Hasło musi zawierać co najmniej jeden znak specjalny',
    passwordChanged: 'Hasło zostało zmienione pomyślnie!',
    fillAllFields: 'Proszę wypełnić wszystkie pola',
    passwordRequirements:
      'Hasło musi mieć co najmniej 8 znaków z 1 wielką literą, 1 cyfrą i 1 znakiem specjalnym',
  },
};

export default function ChangePassword() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const { t: tError } = useChangePasswordErrorTranslations();
  const { token } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const changePasswordMutation = $api.useMutation('post', '/api/auth/change-password');

  const validateForm = () => {
    setValidationError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError(t('fillAllFields'));
      return false;
    }

    // Validate new password
    const passwordValidation = validatePasswordWithMessages(newPassword, {
      tooShort: t('passwordTooShort'),
      missingUppercase: t('passwordMissingUppercase'),
      missingNumber: t('passwordMissingNumber'),
      missingSpecialChar: t('passwordMissingSpecialChar'),
    });
    if (!passwordValidation.isValid) {
      // Get the first validation error
      const firstError = passwordValidation.errors[0];
      if (firstError) {
        setValidationError(firstError);
      }
      return false;
    }

    if (newPassword !== confirmPassword) {
      setValidationError(t('passwordsDoNotMatch'));
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setSuccessMessage('');

    try {
      await changePasswordMutation.mutateAsync({
        body: {
          currentPassword,
          newPassword,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage(t('passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error('Change password error:', error);
      // Error will be displayed via the mutation error state
    }
  };

  const errorMessage = changePasswordMutation.error?.code
    ? tError(changePasswordMutation.error.code)
    : changePasswordMutation.isError
      ? tError('INTERNAL_ERROR')
      : null;

  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col px-8">
      {/* Header */}
      <View className="relative mt-4 w-full flex-row items-center justify-center py-4">
        <TouchableOpacity className="absolute left-0 z-10" onPress={() => router.back()}>
          <ChevronLeft size={24} className="text-gray-600 dark:text-gray-400" />
        </TouchableOpacity>

        <Text className="text-center text-2xl font-bold text-foreground">
          {t('changePassword')}
        </Text>
      </View>

      <View className="mt-8 flex w-full flex-1 items-center">
        {/* Current Password */}
        <View className="relative mb-6 w-full">
          <InputText
            placeholder={t('currentPassword')}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            className="rounded-2xl bg-field pl-12"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <Lock size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>

        {/* New Password */}
        <View className="relative mb-2 w-full">
          <InputText
            placeholder={t('newPassword')}
            secureTextEntry
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              // Clear validation error when user starts typing
              if (validationError) {
                setValidationError('');
              }
            }}
            className="rounded-2xl bg-field pl-12"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <Lock size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>

        {/* Password Requirements */}
        <View className="mb-6 w-full">
          <Text className="text-center text-xs text-muted-foreground">
            {t('passwordRequirements')}
          </Text>
        </View>

        {/* Confirm Password */}
        <View className="relative mb-6 w-full">
          <InputText
            placeholder={t('confirmPassword')}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            className="rounded-2xl bg-field pl-12"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <Lock size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>

        {/* Error Messages */}
        {validationError && (
          <View className="mb-4 w-full">
            <Text className="text-center text-red-500">{validationError}</Text>
          </View>
        )}

        {errorMessage && (
          <View className="mb-4 w-full">
            <Text className="text-center text-red-500">{errorMessage}</Text>
          </View>
        )}

        {/* Success Message */}
        {successMessage && (
          <View className="mb-4 w-full">
            <Text className="text-center text-green-500">{successMessage}</Text>
          </View>
        )}
      </View>

      {/* Save Button */}
      <Button
        onPress={handleChangePassword}
        disabled={changePasswordMutation.isPending}
        className="mb-4 w-full rounded-2xl bg-primary py-2 text-center">
        {changePasswordMutation.isPending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-lg font-semibold text-primary-foreground">{t('save')}</Text>
        )}
      </Button>
    </SafeAreaView>
  );
}
