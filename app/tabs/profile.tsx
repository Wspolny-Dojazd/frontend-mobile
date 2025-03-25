import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { View, FlatList, Switch, TouchableOpacity, Image } from 'react-native';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import React from 'react';
import { useState } from 'react';
import { Text } from '@/src/components/ui/text';
import {
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
  ChevronRight,
} from 'lucide-react-native';

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

type SettingData = {
  id: string;
  icon: React.ReactNode;
  title: string;
  rightElement?: React.ReactNode;
  onPress: () => void;
  textColor?: string;
};

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  rightElement = <ChevronRight size={20} color="#9ca3af" />,
  onPress,
  textColor = '#000',
}) => {
  return (
    <TouchableOpacity className="mb-2 flex-row items-center rounded-xl px-4 py-2" onPress={onPress}>
      <View className="h-8 w-8 items-center justify-center rounded-md bg-gray-100">{icon}</View>
      <Text className="ml-3 flex-1" style={{ color: textColor }}>
        {title}
      </Text>
      <View className="items-center justify-center">{rightElement}</View>
    </TouchableOpacity>
  );
};
export default function App({ username }: { username: string }) {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleNotifications = () => {
    setIsNotificationsEnabled((prev) => !prev);
  };

  const settingsData: SettingData[] = [
    {
      id: '1',
      icon: <BarChart2 size={20} color="#6b7280" />,
      title: t('statistics'),
      onPress: () => console.log('Statistics pressed'),
    },
    {
      id: '2',
      icon: <Settings size={20} color="#6b7280" />,
      title: t('preferences'),
      onPress: () => console.log('Preferences pressed'),
    },
    {
      id: '3',
      icon: isDarkMode ? <Moon size={20} color="#6b7280" /> : <Sun size={20} color="#6b7280" />,
      title: t('dark_mode'),
      rightElement: (
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#e5e7eb', true: '#d1d5db' }}
          thumbColor={isDarkMode ? '#4b5563' : '#f9fafb'}
        />
      ),
      onPress: () => {},
    },
    {
      id: '4',
      icon: <Bell size={20} color="#6b7280" />,
      title: t('notifications'),
      rightElement: <Switch value={isNotificationsEnabled} onValueChange={toggleNotifications} />,
      onPress: () => {},
    },
    {
      id: '5',
      icon: <Globe size={20} color="#6b7280" />,
      title: t('language.text'),
      rightElement: <Text className="text-gray-400">{t('language.secondary')}</Text>,
      onPress: () => console.log('Language pressed'),
    },
    {
      id: '6',
      icon: <Lock size={20} color="#6b7280" />,
      title: t('change_password'),
      onPress: () => console.log('Change password pressed'),
    },
    {
      id: '7',
      icon: <HelpCircle size={20} color="#6b7280" />,
      title: t('help'),
      onPress: () => console.log('Help pressed'),
    },
    {
      id: '8',
      icon: <LogOut size={20} color="#6b7280" />,
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
  ];

  const renderItem = ({ item }: { item: SettingData }) => (
    <SettingItem
      icon={item.icon}
      title={item.title}
      rightElement={item.rightElement}
      onPress={item.onPress}
      textColor={item.textColor}
    />
  );

  const ProfileHeaderComponent: React.FC<{ username: string }> = ({ username }) => (
    <View className="mb-12 mt-6 flex-row items-center justify-between rounded-xl border-8 border-slate-500 bg-slate-300 p-4">
      <View className="flex-row items-center">
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
          className="h-12 w-12 rounded-full border-8 border-indigo-600"
        />
        <Text className="ml-3 text-lg font-medium">
          {t('profile_greeting', { name: username })}
        </Text>
      </View>
      <TouchableOpacity
        className="h-12 w-12 items-center justify-center rounded-full bg-gray-100"
        onPress={() => console.log('Edit profile pressed')}>
        <Pencil size={24} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );

  username = 'John Doe';
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex min-h-full flex-1 flex-col  justify-between px-8">
        <FlatList
          data={settingsData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<ProfileHeaderComponent username={username} />}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 8 }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
