import { Link } from 'expo-router';
import { Lock, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';

import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/auth/newPass';
const TRANSLATIONS = {
  en: {
    newPass: 'Create a new password',
    pass: 'Password',
    passRepeat: 'Repeat password',
    save: 'Save',
  },
  pl: {
    newPass: 'Stwórz nowe hasło',
    pass: 'Hasło',
    passRepeat: 'Powtórz hasło',
    save: 'Zapisz',
  },
};

export default function NewPass() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8">
      <View className="mt-20 flex w-full flex-1 items-center">
        <Text className="mb-28 text-4xl font-bold">{t('newPass')}</Text>
        <View className="relative w-full">
          <InputText
            placeholder={t('pass')}
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
            placeholder={t('passRepeat')}
            secureTextEntry
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            className="w-full rounded-2xl bg-field pl-12"
          />
          <View className="pointer-events-none absolute inset-y-0 left-0 top-2 flex items-center ps-3">
            <Lock size={24} strokeWidth={3} color="#909597" />
          </View>
        </View>
      </View>

      <Button onPress={() => {}} className="mb-4 w-full rounded-2xl bg-primary py-2 text-center">
        <Text className="text-lg font-semibold">{t('save')}</Text>
      </Button>
    </SafeAreaView>
  );
}
