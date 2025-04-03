import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import JoinGroupScreen from '../transit/joinGroup';
import { useAuth } from '@/src/context/authContext';
import { $api } from '@/src/api/api';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';

export default function App() {
  const [screen, setScreen] = useState('home');
  const { token } = useAuth();

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
    },
  };
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);

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
          setScreen('home');
        },
        onError: (error) => {
          console.error('Error creating group:', error);
        },
      }
    );
  };

  return screen === 'join' ? (
    <JoinGroupScreen onBack={() => setScreen('home')} />
  ) : (
    //  <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8">
    <View className="flex-1 bg-gray-100 p-4 dark:bg-gray-900">
      {queryGroups.isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={queryGroups.data || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              className={`mb-2 rounded-lg p-4 ${'active' === 'active' ? 'bg-green-200' : 'bg-white dark:bg-gray-800'}`}>
              <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ID: {item.id}
              </Text>
              <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('noMembers')}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400">
                {t('goal')} {t('noGoal')}
              </Text>

              <Text className="text-gray-500 dark:text-gray-300">
                {t('lastTrip')} wczoraj o 12:00
              </Text>

              <View className="mt-2 flex-row justify-between">
                <TouchableOpacity className="rounded-lg bg-red-500 px-4 py-2">
                  <Text className="text-white">{t('decline')}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="rounded-lg bg-green-500 px-4 py-2">
                  <Text className="text-white">{t('accept')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      <View className="mt-4">
        <TouchableOpacity
          className="mb-2 flex-row items-center justify-center rounded-lg bg-[--primary] p-4"
          onPress={handleCreateGroup}>
          <Text className="ml-2 text-white">{t('newGroup')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-lg bg-[--primary] p-4"
          onPress={() => setScreen('join')}>
          <Text className="ml-2 text-white">{t('joinGroup')}</Text>
        </TouchableOpacity>
      </View>
    </View>
    // </SafeAreaView>
  );
}
