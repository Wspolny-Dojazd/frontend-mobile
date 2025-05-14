import { router } from 'expo-router';
import { Search, ChevronLeft } from 'lucide-react-native';
import { useState, useCallback } from 'react';
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
    alreadyInvited: 'User already invited you',
    error: 'Failed to search users',
    empty: 'No users found',
    searching: 'Searching...',
    sending: 'Sending...',
  },
  pl: {
    title: 'Dodaj znajomego',
    search: 'Wyszukaj nazwę',
    invite: 'Zaproś',
    sent: 'Wysłano',
    alreadyInvited: 'Ten użytkownik już cię zaprosił',
    error: 'Błąd wyszukiwania',
    empty: 'Brak wyników',
    searching: 'Wyszukiwanie...',
    sending: 'Wysyłanie...',
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
  console.log(token);

  const { 
    data: sentInvitations = [], 
    refetch: refetchSent 
  } = $api.useQuery('get', '/api/friend-invitations/sent', {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  const { 
    data: receivedInvitations = [] 
  } = $api.useQuery('get', '/api/friend-invitations/received', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const mutationSearch = $api.useMutation('get', '/api/users/search');

  const mutationSendRequest = $api.useMutation('post', '/api/friend-invitations');

  const handleSearch = useCallback(() => {
    console.log('Search for:', searchQuery.trim())
    if (!searchQuery.trim()) {
      setUsers([]);
      setSearchTrigger('');
      return;
    }

    mutationSearch.mutate(
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: { query: searchQuery.trim() } },
      },
      {
        onSuccess(data) {
          setError(null);
          setUsers(data);
        },

        onError(error, variables, context) {
          Alert.alert(error?.code ?? 'Some error occurred');
        },
      }
    );
  }, [searchQuery, mutationSearch, token]);

  const handleSendRequest = useCallback((userId: string) => {
    mutationSendRequest.mutate(
      {
        headers: { Authorization: `Bearer ${token}` },
        body: { userId },
      },
      {
        onSuccess: () => {
          refetchSent();
        },
        onError: (error) => {
          Alert.alert(error?.code ?? 'Failed to send friend request');
        },
      }
    );
  }, [mutationSendRequest, token, t]);

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
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} className="absolute ml-2 p-2">
            <Search size={24} strokeWidth={3} color="#909597" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        {mutationSearch.isPending ? (
          <Text className="text-center py-4">{t('searching')}</Text>
        ) : error ? (
          <Text className="text-red-500 text-center py-4">{error}</Text>
        ) : users.length === 0 ? (
          <Text className="text-center py-4">{t('empty')}</Text>
        ) : (
          users.map(user => {
            const isSent = sentInvitations.some(invite => 
              invite.receiver.id === user.id
            );
            const isReceived = receivedInvitations.some(invite => 
              invite.sender.id === user.id
            );
            const isSending = mutationSendRequest.isPending && 
              mutationSendRequest.variables?.body?.userId === user.id;
          
            let buttonVariant: 'default' | 'muted' = 'default';
            let buttonText = t('invite');
          
            if (isSending) {
              buttonVariant = 'muted';
              buttonText = t('sending');
            } else if (isSent) {
              buttonVariant = 'muted';
              buttonText = t('sent');
            } else if (isReceived) {
              buttonVariant = 'muted';
              buttonText = t('alreadyInvited');
            }
          
            return (
              <UserBar key={user.id} name={user.nickname}>
                <Button
                  className="min-w-24 rounded-2xl"
                  size="sm"
                  variant={buttonVariant}
                  onPress={!isSent && !isReceived && !isSending ? 
                    () => handleSendRequest(user.id) : 
                    undefined
                  }
                >
                  <Text>{buttonText}</Text>
                </Button>
              </UserBar>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
