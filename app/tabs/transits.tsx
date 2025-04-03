import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { $api } from '@/src/api/api';
import { useGroupErrorTranslations } from '@/src/api/errors/groups/groups';
import { useAuth } from '@/src/context/authContext';
import { ChevronRight } from '@/src/lib/icons';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';
import { useTheme } from '@/src/lib/useTheme';

const NAMESPACE = 'app/tabs/transits';
const TRANSLATIONS = {
  en: {
    goal: 'Goal:',
    lastTrip: 'Last trip:',
    newGroup: 'New group',
    joinGroup: 'Join group',
    accept: 'Accept',
    decline: 'Decline',
    noMembers: 'No members',
    noGoal: 'No goal',
    yourSharedRides: 'Your shared rides',
    search: 'Search...',
    inProgress: 'In progress',
    id: 'Group ID: ',
  },
  pl: {
    goal: 'Cel:',
    lastTrip: 'Ostatni przejazd:',
    newGroup: 'Nowa grupa',
    joinGroup: 'Dołącz do grupy',
    accept: 'Akceptuj',
    decline: 'Odrzuć',
    noMembers: 'Brak członków',
    noGoal: 'Brak celu',
    yourSharedRides: 'Twoje wspólne przejazdy',
    search: 'Szukaj...',
    inProgress: 'W trakcie',
    id: 'Group ID: ',
  },
};

export default function App() {
  const { token } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
  const { t: tErrors } = useGroupErrorTranslations();

  const queryGroups = $api.useQuery('get', '/api/groups', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const mutationCreateGroup = $api.useMutation('post', '/api/groups');

  const handleCreateGroup = () => {
    mutationCreateGroup.mutate(
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        onSuccess(data, variables, context) {
          console.log('Group created successfully:', data);
          router.push('/tabs/transits');
        },
        onError: (error) => {
          console.error('Error creating group:', error);
        },
      }
    );
  };

  if (queryGroups.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (queryGroups.error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-gray-600 dark:text-gray-400">Error loading groups</Text>
        <Text className="text-gray-600 dark:text-gray-400">{tErrors(queryGroups.error.code)}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 p-4">
      <Text className="mx-auto mb-4 text-2xl font-bold text-foreground">
        {t('yourSharedRides')}
      </Text>

      <Pressable className="mb-4 w-full flex-row items-center gap-2 rounded-md bg-white px-3 py-3 dark:bg-gray-900 dark:text-white">
        <Search size={20} className="text-foreground" />
        <Text className="text-lg text-muted-foreground ">{t('search')}</Text>
      </Pressable>

      <FlatList
        data={queryGroups.data || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="relative mb-2 flex flex-col gap-2 rounded-2xl bg-gray-900 p-4">
            <Text className="mx-auto font-semibold text-foreground">{t('inProgress')}</Text>

            <View className="flex-row items-center justify-start gap-2">
              <View className="flex w-6 items-center justify-center">
                <FontAwesome size={16} name="group" color={theme.primary} />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('noMembers')}
              </Text>
            </View>

            <View className="flex-row items-center justify-start gap-2">
              <View className="flex w-6 items-center justify-center">
                <FontAwesome size={16} name="map-marker" color={theme.primary} />
              </View>
              <Text className="text-gray-600 dark:text-gray-400">
                {t('goal')} {t('noGoal')}
              </Text>
            </View>

            <View className="flex-row items-center justify-start gap-2">
              <View className="flex w-6 items-center justify-center">
                <FontAwesome size={16} name="id-card" color={theme.primary} />
              </View>
              <Text className="text-gray-600 dark:text-gray-400">
                {t('id')} {item.id}
              </Text>
            </View>

            {/* <Text className="text-gray-500 dark:text-gray-300">
              {t('lastTrip')} wczoraj o 12:00
            </Text> */}

            <View className="absolute right-4 top-1/2 -translate-y-1/2">
              <ChevronRight size={28} className="text-foreground" />
            </View>

            <View className="mt-2 flex-row justify-between gap-2">
              <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl bg-[var(--danger)] py-4">
                <Text className="text-white">{t('decline')}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl bg-primary py-4">
                <Text className="text-white">{t('accept')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View className="mt-4 flex-row gap-2">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center rounded-2xl bg-subtle p-4"
          onPress={handleCreateGroup}>
          <Text className="text-primary">{t('newGroup')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center rounded-2xl bg-primary p-4"
          onPress={() => router.push('/transit/join-group')}>
          <Text className="text-white">{t('joinGroup')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
