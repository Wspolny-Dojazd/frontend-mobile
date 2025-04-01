import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import JoinGroupScreen from '../transit/joinGroup';

const groups = [
  { id: 1, members: 'Nick1, Nick2', destination: 'Złote tarasy', status: 'invite' },
  { id: 2, members: 'Nick1, Nick2', destination: 'Złote tarasy', status: 'invite' },
  { id: 3, members: 'Nick1, Nick2, Nick3', destination: 'Poniatówka', time: 'wtorek, 10:23' },
];
export default function App() {
  const [screen, setScreen] = useState('home');
  const hasActiveGroup = groups.some((group) => group.status === 'active');

  return screen === 'join' ? (
    <JoinGroupScreen onBack={() => setScreen('home')} />
  ) : (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8">
      <View className="flex-1 bg-gray-100 p-4 dark:bg-gray-900">
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              className={`mb-2 rounded-lg p-4 ${item.status === 'active' ? 'bg-green-200' : 'bg-white dark:bg-gray-800'}`}>
              <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {item.members}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400">Cel: {item.destination}</Text>
              {item.time && (
                <Text className="text-gray-500 dark:text-gray-300">
                  Ostatni przejazd: {item.time}
                </Text>
              )}
              {item.status === 'invite' && (
                <View className="mt-2 flex-row justify-between">
                  <TouchableOpacity className="rounded-lg bg-red-500 px-4 py-2">
                    <Text className="text-white">Odrzuć</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="rounded-lg bg-green-500 px-4 py-2">
                    <Text className="text-white">Akceptuj</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
        {!hasActiveGroup ? (
          <View className="mt-4">
            <TouchableOpacity className="mb-2 flex-row items-center justify-center rounded-lg bg-[--primary] p-4">
              <Text className="ml-2 text-white">Nowa grupa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-lg bg-[--primary] p-4"
              onPress={() => setScreen('join')}>
              <Text className="ml-2 text-white">Dołącz do grupy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity className="absolute bottom-4 right-4 rounded-full bg-[--primary] p-4">
            <MessageCircle size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
