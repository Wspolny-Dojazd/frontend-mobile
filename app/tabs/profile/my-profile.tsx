import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../../src/context/authContext';

import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { Pencil, ChevronLeft } from '@/src/lib/icons';
import { useColorScheme } from '@/src/lib/useColorScheme';

const avatarImage = require('../../../assets/fallback-avatar.png');
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();

  const [emailValue, setEmailValue] = useState('');
  const [nicknameValue, setNicknameValue] = useState('');

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const savedNickname = await AsyncStorage.getItem('localNickname');
      const savedEmail = await AsyncStorage.getItem('localEmail');

      if (savedNickname) setNicknameValue(savedNickname);
      else if (user?.username) setNicknameValue(user.username);

      if (savedEmail) setEmailValue(savedEmail);
      else if (user?.email) setEmailValue(user.email);
    };

    loadData();
  }, [user]);

  const handleSave = async () => {
    const [beforeAt, afterAt] = emailValue.split('@');
    let hasError = false;

    if (!beforeAt || !afterAt || emailValue.split('@').length !== 2) {
      setEmailError('Niepoprawny adres email');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (nicknameValue.trim().length < 3) {
      setNicknameError('Pseudonim musi mieć co najmniej 3 znaki');
      hasError = true;
    } else {
      setNicknameError('');
    }

    if (hasError) return;

    try {
      await AsyncStorage.setItem('localNickname', nicknameValue);
      await AsyncStorage.setItem('localEmail', emailValue);
      setIsEditingNickname(false);
      setIsEditingEmail(false);
      console.log('Saved locally');
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="relative mt-4 w-full flex-row items-center justify-center py-4">
        <TouchableOpacity className="absolute left-4 z-10" onPress={() => router.back()}>
          <ChevronLeft className="text-gray-600 dark:text-gray-400" size={24} />
        </TouchableOpacity>

        <Text className="text-center text-4xl font-semibold text-slate-800 dark:text-white">
          {t('profile')}
        </Text>
      </View>

      <View className="mt-10 flex-col items-center">
        <View className="relative">
          <Image
            source={{ uri: DEFAULT_IMAGE }}
            className="h-32 w-32 rounded-full border-2 border-gray-100 dark:border-gray-700"
          />
          <TouchableOpacity
            className="absolute right-0 top-0 h-10 w-10 items-center justify-center rounded-full bg-teal-600 shadow-sm"
            onPress={() => console.log('Edit profile image')}>
            <Pencil color="white" size={18} />
          </TouchableOpacity>
        </View>

        <Text className="mt-3 text-lg font-medium text-gray-900 dark:text-gray-100">
          {nicknameValue}
        </Text>
      </View>

      <View className="mt-10 w-full px-4">
        {/* Nickname */}
        <View className="mb-6 w-full">
          <Label
            className="mb-2 text-base font-medium text-gray-700 dark:text-gray-300"
            nativeID="nicknameLabel">
            {t('nickname.text')}
          </Label>
          <View className="relative">
            <Input
              value={nicknameValue}
              editable={isEditingNickname}
              onChangeText={(text) => {
                setNicknameValue(text);
                if (nicknameError && text.trim().length >= 3) setNicknameError('');
              }}
              placeholderTextColor={isDark ? '#6B7280' : '#A0AEC0'}
              aria-labelledby="nicknameLabel"
              aria-errormessage="inputError"
            />
            {!isEditingNickname && (
              <TouchableOpacity
                className="absolute right-3 top-2 h-8 w-8 items-center justify-center rounded-full bg-teal-600"
                onPress={() => setIsEditingNickname(true)}>
                <Pencil color="white" size={16} />
              </TouchableOpacity>
            )}
          </View>
          {nicknameError ? (
            <Text className="mt-2 text-sm text-red-500">{nicknameError}</Text>
          ) : null}
        </View>

        {/* Email */}
        <View className="mb-6 w-full">
          <Label
            className="mb-2 text-base font-medium text-gray-700 dark:text-gray-300"
            nativeID="emailLabel">
            {t('email.text')}
          </Label>
          <View className="relative">
            <Input
              value={emailValue}
              editable={isEditingEmail}
              onChangeText={(text) => {
                setEmailValue(text);
                if (emailError && text.includes('@')) setEmailError('');
              }}
              placeholderTextColor={isDark ? '#6B7280' : '#A0AEC0'}
              keyboardType="email-address"
              autoCapitalize="none"
              aria-labelledby="emailLabel"
              aria-errormessage="inputError"
            />
            {!isEditingEmail && (
              <TouchableOpacity
                className="absolute right-3 top-2 h-8 w-8 items-center justify-center rounded-full bg-teal-600"
                onPress={() => setIsEditingEmail(true)}>
                <Pencil color="white" size={16} />
              </TouchableOpacity>
            )}
          </View>
          {emailError ? <Text className="mt-2 text-sm text-red-500">{emailError}</Text> : null}
        </View>
      </View>

      <View className="w-full px-4">
        <TouchableOpacity onPress={handleSave} className="mb-6 mt-6">
          <Text className="w-full rounded-2xl bg-teal-600 py-4 text-center text-lg font-semibold text-white">
            {t('save')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
