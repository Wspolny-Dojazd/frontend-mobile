import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { $api } from '@/src/api/api';
import { useGroupErrorTranslations } from '@/src/api/errors/groups/groups';
import { components } from '@/src/api/openapi';
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
    currentGroupChange: 'To create or join a new group, you need to leave your current group',
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
    currentGroupChange: 'Aby stworzyć albo dołączyć do nowej grupy, musisz opuścić aktualną grupę',
  },
};

type Group = components['schemas']['GroupDto'];

export default function App() {
  const { token } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
  const { t: tErrors } = useGroupErrorTranslations();

  const queryGroups = $api.useQuery('get', '/api/groups', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const numberOfGroupsInProgress = queryGroups.data?.length;
  const shouldShowCreateGroupButton = numberOfGroupsInProgress === 0;

  const mutationCreateGroup = $api.useMutation('post', '/api/groups');

  const queryClient = useQueryClient();
  const invalidateQueryGroups = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['get', '/api/groups'] });
    queryClient.invalidateQueries({ queryKey: ['get', '/api/groups/{id}'] });
  }, [queryClient]);

  const handleCreateGroup = useCallback(() => {
    mutationCreateGroup.mutate(
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        onSuccess(data, variables, context) {
          router.push(`/tabs/transits/${data.id}`);
          invalidateQueryGroups();
        },
        onError: (error) => {
          // TODO: Show translated error
          console.error('Error creating group:', error);
        },
      }
    );
  }, [mutationCreateGroup, router, token, invalidateQueryGroups]);

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

      <Pressable className="mb-4 w-full flex-row items-center gap-2 rounded-md bg-gray-50 px-3 py-3 dark:bg-gray-900 dark:text-white">
        <Search size={20} className="text-foreground" />
        <Text className="text-lg text-muted-foreground ">{t('search')}</Text>
      </Pressable>

      <FlatList
        data={queryGroups.data || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <GroupCard item={item} />}
      />

      {shouldShowCreateGroupButton ? (
        <>
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
        </>
      ) : (
        <View className="mt-4 flex-row gap-2 rounded-2xl bg-subtle p-4 dark:bg-gray-900">
          <Text className="text-center text-gray-600 dark:text-gray-400">
            {t('currentGroupChange')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const GroupCard = ({ item }: { item: Group }) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
  const { t: tErrors } = useGroupErrorTranslations();
  const { token } = useAuth();

  const queryMembers = $api.useQuery('get', '/api/groups/{id}/members', {
    headers: { Authorization: `Bearer ${token}` },
    params: { path: { id: item.id } },
  });

  const MembersList = useCallback(() => {
    if (queryMembers.isLoading) {
      return <ActivityIndicator size="small" color={theme.primary} />;
    }

    if (queryMembers.error) {
      return <Text>{tErrors(queryMembers.error.code)}</Text>;
    }

    return <Text>{queryMembers.data?.map((member) => member.nickname).join(', ')}</Text>;
  }, [queryMembers.data]);

  return (
    <Pressable
      className="relative mb-2 flex flex-col gap-2 rounded-2xl bg-subtle p-4 dark:bg-gray-900"
      onPress={() => router.push(`/tabs/transits/${item.id}`)}>
      <Text className="mx-auto font-semibold text-foreground">{t('inProgress')}</Text>

      <View className="flex-row items-center justify-start gap-2">
        <View className="flex w-6 items-center justify-center">
          <FontAwesome size={16} name="group" color={theme.primary} />
        </View>
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          <MembersList />
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

      {/* <View className="mt-2 flex-row justify-between gap-2">
      <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl bg-[var(--danger)] py-4">
        <Text className="text-white">{t('decline')}</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl bg-primary py-4">
        <Text className="text-white">{t('accept')}</Text>
      </TouchableOpacity>
    </View> */}
    </Pressable>
  );
};
