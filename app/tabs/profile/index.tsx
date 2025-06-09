import { useRouter, Link } from 'expo-router';
import React, { useMemo } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

// Debug auth
//

import { $api } from '@/src/api/api';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/context/authContext';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import {
  ChevronRight,
  BarChart2,
  Settings,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  XCircle,
  Pencil,
} from '@/src/lib/icons';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const NAMESPACE = 'tabs/profile';
const TRANSLATIONS = {
  en: {
    profile_greeting: 'Hi, {{name}}!',
    statistics: 'Statistics',
    preferences: 'Preferences',
    notifications: 'Notifications',
    change_password: 'Change password',
    help: 'Help',
    logout: 'Logout',
    delete_account: 'Delete account',
  },
  pl: {
    profile_greeting: 'Cześć, {{name}}!',
    statistics: 'Statystyki',
    preferences: 'Preferencje',
    notifications: 'Powiadomienia',
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
      className="mb-2 flex-row items-center rounded-xl p-2 dark:bg-gray-900"
      onPress={onPress}>
      <View className="h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
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
  const router = useRouter();
  const { logout, token } = useAuth();
  const queryMe = $api.useQuery('get', '/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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
        onPress: () => router.push('/tabs/profile/preferences'),
      },
      {
        id: '3',
        icon: <Bell size={20} className="text-gray-500 dark:text-gray-400" />,
        title: t('notifications'),
        onPress: () => console.log('Notification pressed'),
      },
      {
        id: '4',
        icon: <Lock size={20} className="text-gray-500 dark:text-gray-400" />,
        title: t('change_password'),
        onPress: () => router.push('/tabs/profile/change-password'),
      },
      {
        id: '5',
        icon: <HelpCircle size={20} className="text-gray-500 dark:text-gray-400" />,
        title: t('help'),
        onPress: () => router.push('/tabs/profile/help'),
      },
      {
        id: '6',
        icon: <LogOut size={20} className="text-gray-500 dark:text-gray-400" />,
        title: t('logout'),
        onPress: () => logout(),
      },
      {
        id: '7',
        icon: <XCircle size={20} color="#ef4444" />,
        title: t('delete_account'),
        textColor: '#ef4444',
        onPress: () => console.log('Delete account pressed'),
      },
    ],
    [router, t]
  );

  const ProfileHeaderComponent: React.FC<{ username: string | undefined; isLoading: boolean }> = ({
    username = 'John Doe',
    isLoading,
  }) => {
    if (isLoading) {
      return (
        <View className="mb-12 mt-6 flex-row items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

    const initials = username?.slice(0, 2).toUpperCase() ?? '??';

    return (
      <View className="mb-12 mt-6 flex-row items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
        <View className="flex-row items-center">
          <View className="h-12 w-12 flex-row items-center justify-center rounded-full border-2 border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
            <Text className="text-lg font-bold text-gray-800 dark:text-white">{initials}</Text>
          </View>
          <Text className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
            {t('profile_greeting', { name: username })}
          </Text>
        </View>
        <TouchableOpacity
          className="h-12 w-12 items-center justify-center rounded-full"
          onPress={() => {
            router.push({
              pathname: '/tabs/profile/my-profile',
              params: { username },
            });
          }}>
          <Pencil size={24} className="text-gray-500 dark:text-gray-400" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex min-h-full flex-1 flex-col justify-between px-4">
        <FlatList
          data={settingsData}
          renderItem={({ item }) => <SettingItem {...item} />}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <ProfileHeaderComponent
              username={queryMe.data?.nickname}
              isLoading={queryMe.isLoading}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 8 }}
        />

        <View className="flex-col items-center justify-center">
          <Link href="/debug-auth" className="mb-1">
            <Text className="text-black underline dark:text-white">Show Auth Debug Info</Text>
          </Link>

          <Text className="text-black dark:text-white">Backend URL: {BACKEND_URL}</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
