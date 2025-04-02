import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from '@/src/lib/useColorScheme';
import { Switch } from '@/src/components/ui/switch';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import {
  ChevronRight,
  BarChart2,
  Settings,
  Moon,
  Sun,
  Bell,
  Globe,
  Lock,
  HelpCircle,
  LogOut,
  XCircle,
  Pencil,
} from '@/src/lib/icons';

// handling dummy image, and fallback image
const avatarImage = require('../../assets/dummy-avatar.png'); // Import the image dynamically
const DEFAULT_IMAGE = avatarImage
  ? Image.resolveAssetSource(avatarImage).uri
  : Image.resolveAssetSource(require('../../assets/fallback-avatar.png')).uri;

const NAMESPACE = 'tabs/profile';
const TRANSLATIONS = {
  en: {
    profile_greeting: 'Hi, {{name}}!',
    statistics: 'Statistics',
    preferences: 'Preferences',
    dark_mode: 'Dark mode',
    notifications: 'Notifications',
    language: {
      text: 'App language',
      secondary: 'English',
    },
    change_password: 'Change password',
    help: 'Help',
    logout: 'Logout',
    delete_account: 'Delete account',
  },
  pl: {
    profile_greeting: 'Cześć, {{name}}!',
    statistics: 'Statystyki',
    preferences: 'Preferencje',
    dark_mode: 'Tryb ciemny',
    notifications: 'Powiadomienia',
    language: {
      text: 'Język aplikacji',
      secondary: 'Polski',
    },
    change_password: 'Zmień hasło',
    help: 'Pomoc',
    logout: 'Wyloguj się',
    delete_account: 'Usuń konto',
  },
};

type SettingItemProps = {
  icon: React.ReactNode;
  title: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  textColor?: string;
};

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  rightElement = <ChevronRight size={20} className="text-gray-400" />,
  onPress,
  textColor,
}) => {
  return (
    <TouchableOpacity
      className="mb-2 flex-row items-center rounded-xl py-1 dark:bg-gray-800"
      onPress={onPress}>
      <View className="h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700">
        {icon}
      </View>

      <Text
        className="ml-3 flex-1 text-gray-900 dark:text-gray-100"
        style={textColor ? { color: textColor } : {}}>
        {title}
      </Text>
      <View className="items-center justify-center">{rightElement}</View>
    </TouchableOpacity>
  );
};

export default function App({ username }: { username: string }) {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const settingsData = useMemo(
    () => [
      {
        id: '1',
        icon: <BarChart2 size={20} className="text-gray-500 dark:text-gray-400" />,
        title: t('statistics'),
        onPress: () => console.log('Statistics pressed'),
      },
      {
        id: '2',
        icon: <Settings size={20} className="text-gray-500 dark:text-gray-400" />,
        title: t('preferences'),
        onPress: () => router.push('/profile/preferences'),
      },
      {
        id: '3',
        icon: isDark ? (
          <Moon size={20} className="text-gray-400" />
        ) : (
          <Sun size={20} className="text-gray-500" />
        ),
        title: t('dark_mode'),
        rightElement: <Switch checked={isDark} onCheckedChange={toggleColorScheme} />,
        onPress: toggleColorScheme,
      },
      {
        id: '4',
        icon: <Bell size={20} className="text-gray-500 dark:text-gray-400" />,
        title: t('notifications'),
        onPress: () => console.log('Notification pressed'),
      },
      {
        id: '5',
        icon: <Globe size={20} className="text-gray-500 dark:text-gray-400" />,
        title: t('language.text'),
        rightElement: <Text className="mx-4 text-gray-400">{t('language.secondary')}</Text>,
        onPress: () => console.log('Language pressed'),
      },
      {
        id: '6',
        icon: <Lock size={20} className="text-gray-500 dark:text-gray-400" />,
        title: t('change_password'),
        onPress: () => console.log('Change password pressed'),
      },
      {
        id: '7',
        icon: <HelpCircle size={20} className="text-gray-500 dark:text-gray-400" />,
        title: t('help'),
        onPress: () => console.log('Help pressed'),
      },
      {
        id: '8',
        icon: <LogOut size={20} className="text-gray-500 dark:text-gray-400" />,
        title: t('logout'),
        onPress: () => console.log('Logout pressed'),
      },
      {
        id: '9',
        icon: <XCircle size={20} color="#ef4444" />,
        title: t('delete_account'),
        textColor: '#ef4444',
        onPress: () => console.log('Delete account pressed'),
      },
    ],
    [colorScheme, router, t, isDark]
  );

  const ProfileHeaderComponent: React.FC<{ username: string }> = ({ username = 'John Doe' }) => {
    return (
      <View className="mb-12 mt-6 flex-row items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
        <View className="flex-row items-center">
          <Image
            source={{ uri: DEFAULT_IMAGE }}
            className="h-12 w-12 rounded-full border-2 border-gray-100 dark:border-gray-700"
          />
          <Text className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
            {t('profile_greeting', { name: username })}
          </Text>
        </View>
        <TouchableOpacity
          className="h-12 w-12 items-center justify-center rounded-full"
          onPress={() => {
            router.push({
              pathname: '/profile/my-profile',
              params: { username, image: DEFAULT_IMAGE }, // passing the image URI
            });
          }}>
          <Pencil size={24} className="text-gray-500 dark:text-gray-400" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex min-h-full flex-1 flex-col justify-between bg-white px-8 dark:bg-gray-900">
        <FlatList
          data={settingsData}
          renderItem={({ item }) => <SettingItem {...item} />}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<ProfileHeaderComponent username={username} />}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 8 }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
