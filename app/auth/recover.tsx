import { router } from 'expo-router';
import { UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TextLanguageSelect from '@/src/components/TextLanguageSelect';
import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/auth/recover';
const TRANSLATIONS = {
  en: {
    reset: 'Password reset',
    link: 'Password reset link will be sent to the email address',
    adress: 'Email address',
    sent: 'Sent',
  },
  pl: {
    reset: 'Resetowanie hasła',
    link: 'Link do odzyskiwania hasła zostanie wysłany na adres e-mail',
    adress: 'Adres email',
    sent: 'Wyślij',
  },
};

export default function Recover() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8">
      <View className="mt-20 flex w-full flex-1 items-center">
        <Text className="mb-28 text-4xl font-bold">{t('reset')}</Text>
        <Text className="mb-12 text-center text-base">{t('link')}</Text>
        <View className="relative w-full">
          <InputText
            placeholder={t('adress')}
            value={email}
            onChangeText={setEmail}
            className="mb-12 rounded-2xl bg-field pl-12"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <UserRound size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>
      </View>
      <Button
        onPress={() => {
          router.replace('auth/newPass');
        }}
        className="mb-4 w-full rounded-2xl bg-primary py-2 text-center">
        <Text className="text-lg font-semibold">{t('sent')}</Text>
      </Button>
    </SafeAreaView>
  );
}
