import { useRouter } from 'expo-router';
import { Search, Plus } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { TouchableOpacity, View, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { $api } from '@/src/api/api';
import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { UserBar } from '@/src/components/userBar';
import { useAuth } from '@/src/context/authContext';
import { UserInfoModal } from '@/src/features/users/UserInfoModal';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

const NAMESPACE = 'app/tabs/friends';
const TRANSLATIONS = {
  en: {
    friends: 'Friends',
    requests: 'Requests',
    search: 'Search friends',
    newRequests: 'NEW REQUESTS',
    sentRequests: 'SENT REQUESTS',
    accept: 'Accept',
    decline: 'Decline',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Failed to load requests',
    accepted: 'Accepted',
    declined: 'Declined',
    cancelled: 'Cancelled',
    noRequests: 'No requests found',
    noSentRequests: 'No sent invitations',
    noMatches: 'No matches found',
  },
  pl: {
    friends: 'Znajomi',
    requests: 'Zaproszenia',
    search: 'Wyszukaj wśród znajomych',
    newRequests: 'NOWE PROŚBY',
    sentRequests: 'WYSŁANE',
    accept: 'Zaakceptuj',
    decline: 'Odrzuć',
    cancel: 'Anuluj',
    loading: 'Ładowanie...',
    error: 'Błąd ładowania',
    accepted: 'Zaakceptowano',
    declined: 'Odrzucono',
    cancelled: 'Anulowano',
    noRequests: 'Brak próśb',
    noSentRequests: 'Brak wysłanych',
    noMatches: 'Brak pasujących',
  },
};

type Status = 'active' | 'away' | 'busy' | 'inactive';
const statusColors: Record<Status, string> = {
  active: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  inactive: 'bg-gray-400',
};

const friends = [
  {
    id: 1,
    name: 'Jane Cooper',
    message: 'lecimy tutaj',
    time: '9:41',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/852/200/200.jpg?hmac=4UHLpiS9j3YDnvq-w-MqnP5-ymiyvMs6BNV5ukoTRrI',
    },
    status: 'active' as const,
    isUnread: true,
    sharedRides: 12,
    sharedKm: 55,
  },
  {
    id: 2,
    name: 'Kristin Watson',
    message: 'siema mordo',
    time: '9:30',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/1077/200/200.jpg?hmac=hiq7UCoz9ZFgr9HcMCpbnKhV-IMyOJqsQtVFyqmqohQ',
    },
    status: 'active' as const,
    isUnread: true,
    sharedRides: 5,
    sharedKm: 78.5,
  },
  {
    id: 3,
    name: 'Darrell Steward',
    message: 'Nostrud eius',
    time: 'pon.',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/277/200/200.jpg?hmac=zlHjTbiytnfBWurpKXXSvMRzVSmkgW13o4K7Q-08r68',
    },
    status: 'inactive' as const,
    isUnread: false,
    sharedRides: 1,
    sharedKm: 4.33,
  },
  {
    id: 4,
    name: 'Guy Hawkins',
    message: 'Aliquip incididunt',
    time: 'pon.',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/231/200/200.jpg?hmac=lUSm6Na5VxIhLKub6Y3JaBOAwCjkimAi-zHEOInwL58',
    },
    status: 'inactive' as const,
    isUnread: false,
    sharedRides: 0,
    sharedKm: 0,
  },
  {
    id: 5,
    name: 'Kayley Tess',
    message: 'Irure inci',
    time: 'niedz.',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/134/200/200.jpg?hmac=a3L-JjVSGeG8w3SdNpzxdh8WSC0xHJXgeD6QryCK7pU',
    },
    status: 'active' as const,
    isUnread: false,
    sharedRides: 78,
    sharedKm: 7653,
  },
  {
    id: 6,
    name: 'Sara Giona',
    message: 'Aute ullamco',
    time: 'niedz.',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/626/200/200.jpg?hmac=k-fpo_bQAtxcljtuQzE1GTq5YEufAV5jjzW3n86c0i0',
    },
    status: 'inactive' as const,
    isUnread: false,
    sharedRides: 1589,
    sharedKm: 432867.2,
  },
  {
    id: 7,
    name: 'Jaye Inga',
    message: 'Nostrud eiusmod',
    time: '13 mar',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/942/200/200.jpg?hmac=Gh7W-H3ZGmweB9STLwQvq-IHkxrVyawHVTKYxy-u9mA',
    },
    status: 'away' as const,
    isUnread: false,
    sharedRides: 666,
    sharedKm: 3245,
  },
  {
    id: 8,
    name: 'Kiran Glaucus',
    message: 'Proident cillum',
    time: '2 mar',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/764/200/200.jpg?hmac=g-JXLL-Box0-4IF64xLkh-OYHpc0kuCIXsRTuaqEPhQ',
    },
    status: 'busy' as const,
    isUnread: false,
    sharedRides: 3,
    sharedKm: 100.11,
  },
];

const FriendChatItem = ({
  name,
  message,
  time,
  imageSource,
  status,
  isUnread,
  onPress,
  onProfilePress,
}: {
  name: string;
  message: string;
  time: string;
  imageSource: any;
  status: Status;
  isUnread: boolean;
  onPress: () => void;
  onProfilePress: () => void;
}) => (
  <TouchableOpacity
    className={`border-b border-muted px-7 py-3 ${isUnread && 'bg-subtle'}`}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button">
    <View className="flex-row items-center justify-between">
      {/* Main content container */}
      <View className="flex-1 flex-row items-center">
        {/* Image container */}
        <TouchableOpacity onPress={onProfilePress}>
          <View className="relative">
            <Image source={imageSource} className="mr-3 h-12 w-12 rounded-full" />
            {/* Status indicator */}
            <View
              className={`absolute bottom-0 right-2 h-4 w-4 rounded-full border-2 border-background ${statusColors[status]}`}
            />
          </View>
        </TouchableOpacity>

        {/* Text container */}
        <View className="flex-1">
          <Text className="text-base font-medium">{name}</Text>
          <Text className="text-sm text-gray-500">{message}</Text>
        </View>
      </View>

      {/* Time display and unread message indicator */}
      <View className="items-end gap-1">
        <View className={`h-3 w-3 rounded-full ${isUnread ? 'bg-primary' : 'bg-background'}`} />
        <Text className="text-sm text-gray-400">{time}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function App() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const [value, setValue] = useState('friends');
  const [name, setName] = useState('');
  const [processedInvitations, setProcessedInvitations] = useState<
    Record<string, 'accepted' | 'declined' | 'cancelled'>
  >({});
  const [processingInvitations, setProcessingInvitations] = useState<Record<string, boolean>>({});
  const [selectedFriend, setSelectedFriend] = useState<(typeof friends)[number] | null>(null);
  const router = useRouter();

  const { token } = useAuth();

  const { data: sentInvitations = [], refetch: refetchSent } = $api.useQuery(
    'get',
    '/api/friend-invitations/sent',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const { data: receivedInvitations = [], refetch: refetchReceived } = $api.useQuery(
    'get',
    '/api/friend-invitations/received',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  useEffect(() => {
    if (value === 'requests') {
      refetchSent();
      refetchReceived();
    }
  }, [value, refetchSent, refetchReceived]);

  const mutationAccept = $api.useMutation('post', '/api/friend-invitations/{id}/accept');
  const mutationDecline = $api.useMutation('delete', '/api/friend-invitations/{id}');

  const handleAction = async (
    invitationId: string,
    actionType: 'accept' | 'decline' | 'cancel'
  ) => {
    try {
      setProcessingInvitations((prev) => ({ ...prev, [invitationId]: true }));

      const mutation = actionType === 'accept' ? mutationAccept : mutationDecline;
      await mutation.mutateAsync({
        headers: { Authorization: `Bearer ${token}` },
        params: { path: { id: invitationId } },
      });

      setProcessedInvitations((prev) => ({
        ...prev,
        [invitationId]:
          actionType === 'accept'
            ? 'accepted'
            : actionType === 'decline'
              ? 'declined'
              : 'cancelled',
      }));
    } catch (error: any) {
      Alert.alert(error?.code ?? t('error'));
    } finally {
      setProcessingInvitations((prev) => ({ ...prev, [invitationId]: false }));
    }
  };

  const handleAddFriendPress = () => {
    router.push('tabs/friends/addFriend');
  };

  const handleProfilePress = (friend: (typeof friends)[number]) => {
    setSelectedFriend(friend);
  };

  const filterInvitations = (invitations: any[], searchQuery: string, isSent: boolean) => {
    if (!searchQuery.trim()) return invitations;

    const query = searchQuery.trim().toLowerCase();
    return invitations.filter((invitation) => {
      const nickname = isSent
        ? invitation.receiver.nickname.toLowerCase()
        : invitation.sender.nickname.toLowerCase();
      return nickname.startsWith(query);
    });
  };

  const filteredReceived = filterInvitations(receivedInvitations, name, false);
  const filteredSent = filterInvitations(sentInvitations, name, true);

  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center">
      <Tabs value={value} onValueChange={setValue} className="w-full">
        <View className="px-5">
          <TabsList className="w-full flex-row">
            <TabsTrigger value="friends" className="flex-1 rounded-full">
              <Text>{t('friends')}</Text>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 rounded-full">
              <Text>{t('requests')}</Text>
            </TabsTrigger>
          </TabsList>
        </View>

        <TabsContent value="friends">
          <View className="w-full flex-row items-center gap-2 rounded-md bg-white px-3 py-3 dark:bg-black dark:text-white">
            <InputText
              placeholder={t('search')}
              value={name}
              onChangeText={setName}
              className="rounded-md bg-gray-100 pl-12 dark:bg-gray-800"
            />
            <View className="pointer-events-none absolute inset-y-0 left-4 top-7 flex items-center ps-3">
              <Search size={20} className="text-gray-500 dark:text-gray-400" />
            </View>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 320 }}>
            {friends.map((friend, index) => (
              <FriendChatItem
                key={index}
                name={friend.name}
                message={friend.message}
                time={friend.time}
                imageSource={friend.imageSource}
                status={friend.status}
                isUnread={friend.isUnread}
                onPress={() =>
                  router.push({
                    pathname: `chat/${friend.id}`,
                    params: {
                      nickname: friend.name,
                      chatType: 'private',
                    },
                  })
                }
                onProfilePress={() => handleProfilePress(friend)}
              />
            ))}
          </ScrollView>
        </TabsContent>

        <TabsContent value="requests">
          <View className="w-full flex-row items-center gap-2 rounded-md bg-white px-3 py-3 dark:bg-black dark:text-white">
            <InputText
              placeholder={t('search')}
              value={name}
              onChangeText={setName}
              className="rounded-2xl bg-gray-100 pl-12 dark:bg-gray-800"
            />
            <View className="pointer-events-none absolute inset-y-0 left-4 top-7 flex items-center ps-3">
              <Search size={20} className="text-gray-500 dark:text-gray-400" />
            </View>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 320 }}>
            {/* Add filter function inside the component */}
            {(() => {
              const filterInvitations = (invitations: any[], isSent: boolean) => {
                if (!name.trim()) return invitations;
                const query = name.trim().toLowerCase();
                return invitations.filter((invitation) => {
                  const nickname = isSent
                    ? invitation.receiver.nickname.toLowerCase()
                    : invitation.sender.nickname.toLowerCase();
                  return nickname.startsWith(query);
                });
              };

              const filteredReceived = filterInvitations(receivedInvitations, false);
              const filteredSent = filterInvitations(sentInvitations, true);

              return (
                <>
                  <Text className="my-2 text-center text-muted-foreground">{t('newRequests')}</Text>

                  {receivedInvitations.length === 0 ? (
                    <Text className="border-t border-muted py-4 text-center text-muted-foreground">
                      {t('noRequests')}
                    </Text>
                  ) : filteredReceived.length === 0 ? (
                    <Text className="border-t border-muted py-4 text-center text-muted-foreground">
                      {name ? t('noMatches') : t('noMatches')}
                    </Text>
                  ) : (
                    filteredReceived.map((invitation) => {
                      const status = processedInvitations[invitation.id];
                      const isProcessing = processingInvitations[invitation.id];

                      return (
                        <UserBar
                          key={invitation.id}
                          name={invitation.sender.nickname}
                          className="border-t border-muted">
                          {status ? (
                            <Text className="text-muted-foreground">
                              {t(status === 'accepted' ? 'accepted' : 'declined')}
                            </Text>
                          ) : (
                            <View className="flex-row gap-2">
                              {!isProcessing && (
                                <Button
                                  className="rounded-2xl"
                                  size="sm"
                                  variant="muted"
                                  onPress={() => handleAction(invitation.id, 'decline')}
                                  disabled={isProcessing}>
                                  <Text
                                    className={
                                      isProcessing ? 'text-foreground' : 'text-destructive'
                                    }>
                                    {isProcessing ? t('loading') : t('decline')}
                                  </Text>
                                </Button>
                              )}
                              <Button
                                className="rounded-2xl"
                                size="sm"
                                variant={isProcessing ? 'muted' : 'default'}
                                onPress={() => handleAction(invitation.id, 'accept')}
                                disabled={isProcessing}>
                                <Text className={isProcessing ? 'text-foreground' : 'text-default'}>
                                  {isProcessing ? t('loading') : t('accept')}
                                </Text>
                              </Button>
                            </View>
                          )}
                        </UserBar>
                      );
                    })
                  )}

                  <Text className="mb-2 mt-8 text-center text-muted-foreground">
                    {t('sentRequests')}
                  </Text>

                  {sentInvitations.length === 0 ? (
                    <Text className="border-t border-muted py-4 text-center text-muted-foreground">
                      {t('noSentRequests')}
                    </Text>
                  ) : filteredSent.length === 0 ? (
                    <Text className="border-t border-muted py-4 text-center text-muted-foreground">
                      {name ? t('noMatches') : t('noMatches')}
                    </Text>
                  ) : (
                    filteredSent.map((invitation) => {
                      const status = processedInvitations[invitation.id];
                      const isProcessing = processingInvitations[invitation.id];

                      return (
                        <UserBar
                          key={invitation.id}
                          name={invitation.receiver.nickname}
                          className="border-t border-muted">
                          {status ? (
                            <Text className="text-muted-foreground">{t('cancelled')}</Text>
                          ) : (
                            <Button
                              className="rounded-2xl"
                              size="sm"
                              variant="muted"
                              onPress={() => handleAction(invitation.id, 'cancel')}
                              disabled={isProcessing}>
                              <Text
                                className={isProcessing ? 'text-foreground' : 'text-destructive'}>
                                {isProcessing ? t('loading') : t('cancel')}
                              </Text>
                            </Button>
                          )}
                        </UserBar>
                      );
                    })
                  )}
                </>
              );
            })()}
          </ScrollView>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <Button
        className="absolute bottom-8 right-8 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/30"
        size="icon"
        onPress={handleAddFriendPress} // Add your action here
      >
        <Plus size={28} color="white" strokeWidth={2.5} />
      </Button>

      {selectedFriend && (
        <UserInfoModal
          visible={!!selectedFriend}
          onClose={() => setSelectedFriend(null)}
          friend={{ ...selectedFriend }}
          onRemove={() => {
            setSelectedFriend(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}
