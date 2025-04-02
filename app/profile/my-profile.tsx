import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { Pencil, ChevronLeft } from '@/src/lib/icons';

const avatarImage = require('../../assets/fallback-avatar.png'); // Import the image dynamically
const DEFAULT_IMAGE = Image.resolveAssetSource(avatarImage).uri;

const NAMESPACE = 'profile/my-profile';
const TRANSLATIONS = {
  en: {
    profile: 'My profile',
    nickname: {
      text: 'Nickname',
      secondary: 'Your nickname',
    },
    email: {
      text: 'Email',
      secondary: 'Your address email',
    },
    save: 'Save changes',
  },
  pl: {
    profile: 'Mój profil',
    nickname: {
      text: 'Pseudonim',
      secondary: 'Twój pseudonim',
    },
    email: {
      text: 'Email',
      secondary: 'Twój adres e-mail',
    },
    save: 'Zapisz zmiany',
  },
};

export default function App() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const router = useRouter();
  const { username, image } = useLocalSearchParams();

  const [emailValue, setEmailValue] = useState('');
  const [nicknameValue, setNicknameValue] = useState('');

  const handleEmailChange = (text: string) => {
    setEmailValue(text);
  };
  const handleNicknameChange = (text: string) => {
    setNicknameValue(text);
  };

  return (
    <SafeAreaView className="flex items-center justify-center">
      <View className="relative mt-4 w-full flex-row items-center justify-center py-4">
        <TouchableOpacity
          className="absolute left-4 z-10"
          onPress={() => {
            router.back();
          }}>
          <ChevronLeft color="#666" size={24} />
        </TouchableOpacity>

        <Text className="text-center text-4xl font-semibold text-slate-800">{t('profile')}</Text>
      </View>

      <View className="mt-10 flex-col items-center">
        <View className="relative">
          <Image
            source={{ uri: typeof image === 'string' ? image : DEFAULT_IMAGE }}
            className="h-32 w-32 rounded-full border-2 border-gray-100"
          />

          <TouchableOpacity
            className="absolute right-0 top-0 h-10 w-10 items-center justify-center rounded-full bg-teal-600 shadow-sm"
            onPress={() => {
              console.log('Edit profile image');
            }}>
            <Pencil color="white" size={18} />
          </TouchableOpacity>
        </View>

        <Text className="mt-3 text-lg font-medium">{username}</Text>
      </View>
      <View className="mt-10 w-full px-4">
        {/* Nickname Field */}
        <View className="mb-6 w-full">
          <Label className="mb-2 text-base font-medium text-gray-700" nativeID="nicknameLabel">
            {t('nickname.text')}
          </Label>
          <View className="relative">
            <Input
              placeholder="jfk1337_PL"
              placeholderTextColor="#A0AEC0"
              value={nicknameValue}
              onChangeText={handleNicknameChange}
              aria-labelledby="nicknameLabel"
              aria-errormessage="inputError"
            />
          </View>
        </View>

        {/* Email Field */}
        <View className="mb-6 w-full">
          <Label className="mb-2 text-base font-medium text-gray-700" nativeID="emailLabel">
            {t('email.text')}
          </Label>
          <View className="relative">
            <Input
              placeholder="example@email.com"
              placeholderTextColor="#A0AEC0"
              value={emailValue}
              onChangeText={handleEmailChange}
              aria-labelledby="emailLabel"
              aria-errormessage="inputError"
            />
          </View>
        </View>
      </View>

      <View className="w-full px-4">
        <TouchableOpacity onPress={() => console.log('Save changes')} className="mb-6 mt-6">
          <Text className="w-full rounded-2xl bg-teal-600 py-4 text-center text-lg font-semibold text-white">
            {t('save')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
