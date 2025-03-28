import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/src/components/ui/text';
import { View, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

import { Pencil, ChevronLeft } from '@/src/lib/icons';

const avatarImage = require('../../assets/random_avatar.png'); // Import the image dynamically
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
      secondary: 'Your email address',
    },
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
  },
};

export default function App() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const router = useRouter();
  const { username } = useLocalSearchParams();

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
            source={{ uri: DEFAULT_IMAGE }}
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

      {/* <Link href="/tabs/profile">
      <Text>(DEBUG) Go to Preferences</Text>
    </Link> */}
    </SafeAreaView>
  );
}
