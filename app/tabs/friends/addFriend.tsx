import { router } from 'expo-router';
import { Search, ChevronLeft } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { UserBar } from '@/src/components/userBar';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { $api } from '@/src/api/api';
import { useAuth } from '@/src/context/authContext';

const NAMESPACE = 'app/friends/addFriend';
const TRANSLATIONS = {
  en: {
    title: 'Invite friends',
    search: 'Search username',
    invite: 'Invite',
    sent: 'Sent',
    error: 'Failed to search users',
    empty: 'No users found',
    loading: 'Searching...',
  },
  pl: {
    title: 'Dodaj znajomego',
    search: 'Wyszukaj nazwę',
    invite: 'Zaproś',
    sent: 'Wysłano',
    error: 'Błąd wyszukiwania',
    empty: 'Brak wyników',
    loading: 'Wyszukiwanie...',
  },
};

type User = {
  id: string;
  username: string;
  nickname: string;
  email: string;
};

export default function AddFriendView() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  console.log('Sending searchTrigger in useQuery:', searchTrigger);
  const { data, isLoading, error: queryError } = $api.useQuery(
    'get',
    '/api/users/search',
    {
      headers: { Authorization: `Bearer ${token}` },
      query: { query: searchTrigger },
    }
  );

  // Update users or error when API result changes
  useEffect(() => {
    if (queryError) {
      console.error('Search error:', queryError);
      setError(t('error'));
      Alert.alert(queryError?.message || t('error'));
      return;
    }

    if (data) {
      setError(null);
      setUsers(
        data.map((user: User) => ({
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          invited: false,
        }))
      );
    }
  }, [data, queryError]);

  const handleSearch = () => {
    console.log('Search for:', searchQuery.trim())
    if (!searchQuery.trim()) {
      setUsers([]);
      setSearchTrigger('');
      return;
    }
    setSearchTrigger(searchQuery.trim());
  };

  // const handleSendRequest = async (userId: string) => {
  //   try {
  //     await $api.useQuery('post', '/api/friend-invitations', {
  //       headers: { Authorization: `Bearer ${token}` },
  //       body: { userId },
  //     });

  //     setUsers(prev =>
  //       prev.map(user =>
  //         user.id === userId ? { ...user } : user
  //       )
  //     );
  //   } catch (err: any) {
  //     console.error('Invite error:', err);
  //     const errorMessage = err.response?.data?.message || t('error');
  //     setError(errorMessage);
  //     Alert.alert(errorMessage);
  //   }
  // };

  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ChevronLeft size={24} strokeWidth={2.5} color="#909597" />
        </TouchableOpacity>
        <View className="absolute left-0 right-0 flex-1 items-center">
          <Text className="text-2xl font-bold">{t('title')}</Text>
        </View>
      </View>

      <View className="relative my-4 w-full px-7">
        <View className="flex-row items-center">
          <InputText
            placeholder={t('search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 rounded-2xl bg-field pl-12"
            // onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} className="absolute ml-2 p-2 ">
            <Search size={24} strokeWidth={3} color="#3d917c" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        {isLoading ? (
          <Text className="text-center py-4">{t('loading')}</Text>
        ) : error ? (
          <Text className="text-red-500 text-center py-4">{error}</Text>
        ) : users.length === 0 && searchTrigger ? (
          <Text className="text-center py-4">{t('empty')}</Text>
        ) : (
          users.map(user => (
            <UserBar key={user.id} name={user.nickname}>
              <Button
                className="min-w-24 rounded-2xl"
                size="sm"
                variant="default"
                // onPress={() => handleSendRequest(user.id)}
                onPress={() => console.log('Invite user:', user.id)}
              >
                <Text>{t('invite')}</Text>
              </Button>
            </UserBar>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
