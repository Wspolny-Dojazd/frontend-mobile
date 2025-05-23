import { router } from 'expo-router';
import { Search, ChevronLeft } from 'lucide-react-native';
import { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { $api } from '@/src/api/api';
import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { UserBar } from '@/src/components/userBar';
import { useAuth } from '@/src/context/authContext';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/friends/addFriend';
const TRANSLATIONS = {
  en: {
    title: 'Invite friends',
    search: 'Search username',
    invite: 'Invite',
    sent: 'Sent',
    alreadyInvited: 'User already invited you',
    alreadyFriends: 'Already friends',
    error: 'Failed to search users',
    empty: 'No users found',
    searching: 'Searching...',
    sending: 'Sending...',
    instruction: "Input user's nickname above to search",
  },
  pl: {
    title: 'Dodaj znajomego',
    search: 'Wyszukaj nazwę',
    invite: 'Zaproś',
    sent: 'Wysłano',
    alreadyInvited: 'Ten użytkownik już cię zaprosił',
    alreadyFriends: 'Jesteście już znajomymi',
    error: 'Błąd wyszukiwania',
    empty: 'Brak wyników',
    searching: 'Wyszukiwanie...',
    sending: 'Wysyłanie...',
    instruction: 'Wpisz nazwę użytkownika powyżej, aby wyszukać',
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
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();
  const { data: me } = $api.useQuery('get', '/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { data: sentInvitations = [], refetch: refetchSent } = $api.useQuery(
    'get',
    '/api/friend-invitations/sent',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const { data: receivedInvitations = [] } = $api.useQuery(
    'get',
    '/api/friend-invitations/received',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const { data: friendsList = [] } = $api.useQuery('get', '/api/friends', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const friends: User[] = Array.isArray(friendsList) ? friendsList : [friendsList];

  const mutationSearch = $api.useMutation('get', '/api/users/search');

  const mutationSendRequest = $api.useMutation('post', '/api/friend-invitations');

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setUsers([]);
      setSearchTrigger('');
      return;
    }

    // Clear previous timeout
    if (searchTimeout) clearTimeout(searchTimeout);

    // Set new timeout
    const timeout = setTimeout(() => {
      mutationSearch.mutate(
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { query: { query: searchQuery.trim() } },
        },
        {
          onSuccess(data) {
            setError(null);
            const filteredData = me ? data.filter((user) => user.id !== me.id) : data;
            setUsers(filteredData);
            setSearchTrigger(searchQuery.trim());
          },
          onError(error) {
            Alert.alert(error?.code ?? t('error'));
            setSearchTrigger('');
          },
        }
      );
    }, 300); // 300ms debounce time

    setSearchTimeout(timeout);

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchQuery, token]);

  const handleSendRequest = useCallback(
    (userId: string) => {
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
    },
    [mutationSendRequest, token, t]
  );

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
        <InputText
          placeholder={t('search')}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            // Clear results immediately when clearing input
            if (text.trim() === '') {
              setUsers([]);
              setSearchTrigger('');
            }
          }}
          className="flex-1 rounded-2xl bg-field pl-12"
          returnKeyType="search"
        />
        <View className="pointer-events-none absolute inset-y-0 left-7 top-3 flex items-center ps-3">
          <Search size={24} strokeWidth={3} color="#909597" />
        </View>
      </View>

      <ScrollView>
        {mutationSearch.isPending ? (
          <Text className="py-4 text-center">{t('searching')}</Text>
        ) : error ? (
          <Text className="py-4 text-center text-red-500">{error}</Text>
        ) : searchTrigger === '' ? (
          <Text className="py-4 text-center">{t('instruction')}</Text>
        ) : users.length === 0 && searchTrigger ? (
          <Text className="py-4 text-center">{t('empty')}</Text>
        ) : (
          users.map((user) => {
            const isSent = sentInvitations.some((invite) => invite.receiver.id === user.id);
            const isReceived = receivedInvitations.some((invite) => invite.sender.id === user.id);
            const isFriend = friends.some((friend) => friend.id === user.id);
            const isSending =
              mutationSendRequest.isPending &&
              mutationSendRequest.variables?.body?.userId === user.id;

            let buttonVariant: 'default' | 'muted' = 'default';
            let buttonText = t('invite');

            if (isSending) {
              buttonVariant = 'muted';
              buttonText = t('sending');
            } else if (isFriend) {
              buttonVariant = 'muted';
              buttonText = t('alreadyFriends');
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
                  onPress={
                    !isFriend && !isSent && !isReceived && !isSending
                      ? () => handleSendRequest(user.id)
                      : undefined
                  }>
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
