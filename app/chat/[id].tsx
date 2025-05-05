import Monicon from '@monicon/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import i18n from '@/i18n';
import { $api } from '@/src/api/api';
import { useAuth } from '@/src/context/authContext';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/tabs/friends/[id]';
const TRANSLATIONS = {
  en: {
    transit: 'During transit',
    active: 'Active now',
    message: 'Type a message...',
    groupchat: 'Group chat',
    noMessages: 'No messages found',
    userLeft: '[ User left the group ]',
  },
  pl: {
    transit: 'W trakcie przejazdu',
    active: 'Aktywny/a teraz',
    message: 'Napisz wiadomość...',
    groupchat: 'Czat grupy',
    noMessages: 'Brak wiadomości',
    userLeft: '[ Użytkownik opuścił grupę ]',
  },
};

type Message = {
  id: number;
  userId: string;
  content: string;
  createdAt: string;
};

type ChatParams = {
  id: string;
  nickname: string;
  chatType: 'private' | 'group';
  members?: string;
};

export default function ChatScreen() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const router = useRouter();
  const params = useLocalSearchParams<ChatParams>();
  const language = i18n.language === 'pl' ? 'pl-PL' : 'en-US';
  const [messageInput, setMessageInput] = useState('');

  const { token } = useAuth();
  const { data: me } = $api.useQuery('get', '/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const mockMessages: Message[] = [
    {
      id: 1,
      content:
        'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: me ? me.id : '1',
    },
    { id: 2, content: 'Sure! Thank you', createdAt: '2025-05-02T11:55:03.490Z', userId: '2' },
    {
      id: 3,
      content: 'Could you please ask the restaurant to give me cutlery? I just need these items.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: '3',
    },
    {
      id: 4,
      content: 'Yes, let me tell the restaurant.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: '4',
    },
    {
      id: 5,
      content:
        'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: me ? me.id : '1',
    },
    { id: 6, content: 'Sure! Thank you', createdAt: '2025-05-02T11:55:03.490Z', userId: '2' },
    {
      id: 7,
      content: 'Could you please ask the restaurant to give me cutlery? I just need these items.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: '3',
    },
    {
      id: 8,
      content: 'Yes, let me tell the restaurant.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: '4',
    },
    {
      id: 9,
      content:
        'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: me ? me.id : '1',
    },
    { id: 10, content: 'Sure! Thank you', createdAt: '2025-05-02T11:55:03.490Z', userId: '2' },
    {
      id: 11,
      content: 'Could you please ask the restaurant to give me cutlery? I just need these items.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: '3',
    },
    {
      id: 12,
      content: 'Yes, let me tell the restaurant.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: '4',
    },
    {
      id: 13,
      content:
        'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: me ? me.id : '1',
    },
    { id: 14, content: 'Sure! Thank you', createdAt: '2025-05-02T11:55:03.490Z', userId: '2' },
    {
      id: 15,
      content: 'Could you please ask the restaurant to give me cutlery? I just need these items.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: '3',
    },
    {
      id: 16,
      content: 'Yes, let me tell the restaurant.',
      createdAt: '2025-05-02T11:55:03.490Z',
      userId: '4',
    },
  ];

  const mockFriend = {
    id: 2,
    nickname: params.nickname,
  };

  const { data: members = [] } = $api.useQuery(
    'get',
    '/api/groups/{id}/members',
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { path: { id: Number(params.id) } },
    },
    {
      refetchInterval: 1000,
    }
  );

  const otherMembers = useMemo(() => {
    // Handle loading/error states
    if (!members) return [];

    return members.filter((member) => member.id !== me?.id);
  }, [members, me?.id]);

  const { data: groupMessages } = $api.useQuery(
    'get',
    '/api/groups/{id}/messages',
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { path: { id: Number(params.id) } },
    },
    {
      refetchInterval: 1000,
    }
  );

  const messages = params.chatType === 'group' ? groupMessages?.slice().reverse() : mockMessages;

  const mutationSendMessage = $api.useMutation('post', '/api/groups/{id}/messages');

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim()) return;

    const newMessage = messageInput;
    setMessageInput('');

    mutationSendMessage.mutate(
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { path: { id: Number(params.id) } },
        body: { content: newMessage },
      },
      {
        // onSuccess(data, variables, context) {
        // },
        onError(error, variables, context) {
          Alert.alert(error?.code ?? 'Some error occurred');
        },
      }
    );
  }, [params.id, mutationSendMessage, token]);

  // Header
  const renderHeader = () => (
    <View className="flex-row items-center justify-between border-b border-muted bg-background px-4 py-3">
      <TouchableOpacity onPress={() => router.back()}>
        <Monicon name="tabler:chevron-left" size={28} color="#A9A9A9" />
      </TouchableOpacity>

      <View className="mx-1 flex-1 flex-row items-center">
        {params.chatType === 'group' ? (
          <View className="mr-2 flex-row items-center">
            {/* Avatar container */}
            <View className="relative -top-1 mr-4">
              <View className="h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
                <Text className="text-lg font-extrabold text-foreground">
                  {otherMembers[0]?.nickname?.slice(0, 2)}
                </Text>
              </View>
              {otherMembers.length >= 2 && (
                <View
                  className="absolute -bottom-3 -right-3 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
                  style={{ zIndex: 1 }}>
                  <Text className="text-lg font-extrabold text-foreground">
                    {otherMembers[1]?.nickname?.slice(0, 2)}
                  </Text>
                </View>
              )}
            </View>
            {members.length > 2 && (
              <Text className="text-sm text-gray-500">+{members.length - 2}</Text>
            )}
          </View>
        ) : (
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <Text className="text-lg font-extrabold text-foreground">
              {params.nickname?.slice(0, 2)}
            </Text>
          </View>
        )}
        <View>
          <Text className="text-xl font-semibold text-black dark:text-white">
            {params.nickname || t('groupchat')}
          </Text>
          <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {params.chatType === 'group' ? t('transit') : t('active')}
          </Text>
        </View>
      </View>

      {params.chatType === 'private' && (
        <TouchableOpacity className="p-2">
          <Monicon name="tabler:location-filled" size={28} color="#3d917c" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMessage = ({ item, prevItem }: { item: Message; prevItem?: Message | null }) => {
    const isCurrentUser = item.userId === me?.id;
    const sender =
      params.chatType === 'private'
        ? item.userId !== me?.id
          ? mockFriend
          : null
        : members?.find((member) => member.id === item.userId);

    const date = new Date(item.createdAt);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const messageDateStr = date.toISOString().split('T')[0];
    const prevMessageDateStr = prevItem
      ? new Date(prevItem.createdAt).toISOString().split('T')[0]
      : null;

    const showDateSeparator = !prevItem || messageDateStr !== prevMessageDateStr;

    return (
      <>
        <View className={`w-full flex-row ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
          {/* Sender's avatar */}
          {!isCurrentUser && (
            <View className="mr-2 self-start">
              <View className="h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
                <Text className="text-lg font-extrabold text-foreground">
                  {sender?.nickname?.slice(0, 2)}
                </Text>
              </View>
            </View>
          )}

          {/* Message container */}
          <View className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            {/* Sender name for group chats */}
            {params.chatType === 'group' && !isCurrentUser && (
              <Text className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                {sender ? sender.nickname : t('userLeft')}
              </Text>
            )}

            {/* Message bubble */}
            <View
              className={`rounded-2xl px-3 py-2 ${
                isCurrentUser ? 'rounded-tr-sm bg-primary' : 'rounded-tl-sm bg-muted'
              }`}>
              <Text
                className={`text-base ${isCurrentUser ? 'text-white' : 'text-black dark:text-white'}`}>
                {item.content}
              </Text>
            </View>

            {/* Time stamp */}
            <Text
              className={`mt-1 text-xs text-gray-500 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
              {time}
            </Text>
          </View>

          {/* Current user avatar */}
          {isCurrentUser && (
            <View className="ml-2 self-start">
              <View className="h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
                <Text className="text-lg font-extrabold text-foreground">
                  {me?.nickname?.slice(0, 2)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {showDateSeparator && (
          <View className="my-4 flex-row items-center justify-center">
            <View className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
            <Text className="mx-4 text-sm text-gray-500 dark:text-gray-400">
              {date.toLocaleDateString(language, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <View className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
          </View>
        )}
      </>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {renderHeader()}

      {/* Chat */}
      <FlatList
        data={messages}
        renderItem={({ item, index }) => {
          const prevItem = (messages ?? [])[index + 1];
          return renderMessage({ item, prevItem });
        }}
        keyExtractor={(item) => item.id.toString()}
        className="flex-1 p-4"
        inverted
        contentContainerStyle={{
          paddingTop: 60,
          paddingBottom: 30,
          flexGrow: 1,
          justifyContent: 'flex-end',
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">{t('noMessages')}</Text>
          </View>
        }
      />

      <View
        className="absolute bottom-0 left-0 right-0 flex-row items-center border-t border-muted bg-background p-3"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
        }}>
        <TextInput
          className="mr-2 flex-1 rounded-full bg-muted px-4 py-2 dark:text-white"
          placeholder={t('message')}
          placeholderTextColor="#888"
          value={messageInput}
          onChangeText={setMessageInput}
        />
        <TouchableOpacity
          className="px-2"
          onPress={handleSendMessage}
          disabled={!messageInput.trim()}>
          <Monicon name="fa:send-o" size={26} color="#3d917c" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
