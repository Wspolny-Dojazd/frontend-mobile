import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Alert
  } from 'react-native';
  import Monicon from '@monicon/native';
  import { useRouter, useLocalSearchParams } from 'expo-router';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
  import { useAuth } from '@/src/context/authContext';
  import { $api } from '@/src/api/api';
  import { useCallback, useState, useMemo } from 'react';
  import i18n from '@/i18n';
  
  const NAMESPACE = 'app/tabs/friends/[id]';
  const TRANSLATIONS = {
    en: {
      transit: 'During transit',
      active: 'Active now',
      message: 'Type a message...',
      groupchat: 'Group chat',
      noMessages: 'No messages found',
    },
    pl: {
      transit: 'W trakcie przejazdu',
      active: 'Aktywny/a teraz',
      message: 'Napisz wiadomość...',
      groupchat: 'Czat grupy',
      noMessages: 'Brak wiadomości',
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
    const language = i18n.language === 'pl' ? 'pl-PL' : 'en-US'
    const [messageInput, setMessageInput] = useState('');

    const { token } = useAuth();
    const { data: me } = $api.useQuery('get', '/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const mockMessages: Message[] = [
      { id: 1, content: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', createdAt: '2025-05-02T11:55:03.490Z', userId: me ? me.id : '1' },
      { id: 2, content: 'Sure! Thank you', createdAt: '2025-05-02T11:55:03.490Z', userId: '2' },
      { id: 3, content: 'Could you please ask the restaurant to give me cutlery? I just need these items.', createdAt: '2025-05-02T11:55:03.490Z', userId: '3' },
      { id: 4, content: 'Yes, let me tell the restaurant.', createdAt: '2025-05-02T11:55:03.490Z', userId: '4' },
      { id: 5, content: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', createdAt: '2025-05-02T11:55:03.490Z', userId: me ? me.id : '1' },
      { id: 6, content: 'Sure! Thank you', createdAt: '2025-05-02T11:55:03.490Z', userId: '2' },
      { id: 7, content: 'Could you please ask the restaurant to give me cutlery? I just need these items.', createdAt: '2025-05-02T11:55:03.490Z', userId: '3' },
      { id: 8, content: 'Yes, let me tell the restaurant.', createdAt: '2025-05-02T11:55:03.490Z', userId: '4' },
      { id: 9, content: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', createdAt: '2025-05-02T11:55:03.490Z', userId: me ? me.id : '1' },
      { id: 10, content: 'Sure! Thank you', createdAt: '2025-05-02T11:55:03.490Z', userId: '2' },
      { id: 11, content: 'Could you please ask the restaurant to give me cutlery? I just need these items.', createdAt: '2025-05-02T11:55:03.490Z', userId: '3' },
      { id: 12, content: 'Yes, let me tell the restaurant.', createdAt: '2025-05-02T11:55:03.490Z', userId: '4' },
      { id: 13, content: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', createdAt: '2025-05-02T11:55:03.490Z', userId: me ? me.id : '1' },
      { id: 14, content: 'Sure! Thank you', createdAt: '2025-05-02T11:55:03.490Z', userId: '2' },
      { id: 15, content: 'Could you please ask the restaurant to give me cutlery? I just need these items.', createdAt: '2025-05-02T11:55:03.490Z', userId: '3' },
      { id: 16, content: 'Yes, let me tell the restaurant.', createdAt: '2025-05-02T11:55:03.490Z', userId: '4' },
    ];

    const mockFriend = {
      id: 2,
      nickname: params.nickname
    };

    const { data: members = [] } = $api.useQuery('get', '/api/groups/{id}/members',
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
      
      return members.filter(member => 
        member.id !== me?.id
      );
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

    const messages = params.chatType === 'group' 
      ? groupMessages?.slice().reverse()
      : mockMessages;

    const mutationSendMessage = $api.useMutation('post', '/api/groups/{id}/messages');
  
    const handleSendMessage = useCallback(() => {
      if (!messageInput.trim()) return;

      const newMessage = messageInput;
      setMessageInput('');

      mutationSendMessage.mutate(
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { path: { id: Number(params.id) } },
          body: { content: newMessage }
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
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-muted bg-background">
        <TouchableOpacity onPress={() => router.back()}>
          <Monicon name="tabler:chevron-left" size={28} color="#A9A9A9" />
        </TouchableOpacity>
  
        <View className="flex-row items-center flex-1 mx-1">
          {params.chatType === 'group' ? (
            <View className="flex-row items-center mr-2">
              {/* Avatar container */}
              <View className="relative mr-4 -top-1">
                <View className="w-10 h-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
                  <Text className='text-lg font-extrabold text-foreground'>
                    { otherMembers[0]?.nickname?.slice(0, 2) }
                  </Text>
                </View>
                {otherMembers.length >= 2 && (
                  <View
                    className="absolute -right-3 -bottom-3 w-10 h-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
                    style={{ zIndex: 1 }}
                  >
                    <Text className='text-lg font-extrabold text-foreground'>
                    { otherMembers[1]?.nickname?.slice(0, 2) }
                    </Text>
                  </View>
                )}
              </View>
              {members.length > 2 && (
                <Text className="text-gray-500 text-sm">+{members.length - 2}</Text>
              )}
            </View>
          ) : (
            <View className="w-10 h-10 mr-3 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
              <Text className='text-lg font-extrabold text-foreground'>
                { params.nickname?.slice(0, 2) }
              </Text>
            </View>
          )}
          <View>
            <Text className="text-xl font-semibold text-black dark:text-white">
              {params.nickname || t('groupchat')}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {params.chatType === 'group' 
                ? t('transit')
                : t('active')}
            </Text>
          </View>
        </View>
        
        { params.chatType === 'private' && (
          <TouchableOpacity className="p-2">
            <Monicon name="tabler:location-filled" size={28} color="#3d917c" />
          </TouchableOpacity>
        )}
      </View>
    );
  
    const renderMessage = ({ item, prevItem }: { item: Message, prevItem?: Message | null; }) => {
      const isCurrentUser = item.userId === me?.id;
      const sender = params.chatType === 'private'
        ? (item.userId !== me?.id ? mockFriend : null)
        : members?.find(member => member.id === item.userId);

      const date = new Date(item.createdAt);
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      const messageDateStr = date.toISOString().split('T')[0];
      const prevMessageDateStr = prevItem ? new Date(prevItem.createdAt).toISOString().split('T')[0] : null;

      const showDateSeparator = !prevItem || messageDateStr !== prevMessageDateStr;
    
      return (
        <>
          <View className={`w-full flex-row ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
            {/* Sender's avatar */}
            {!isCurrentUser && sender && (
              <View className="mr-2 self-start">
                <View className="w-10 h-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
                  <Text className='text-lg font-extrabold text-foreground'>
                    {sender?.nickname?.slice(0, 2)}
                  </Text>
                </View>
              </View>
            )}
      
            {/* Message container */}
            <View className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
              {/* Sender name for group chats */}
              {params.chatType === 'group' && !isCurrentUser && (
                <Text className="text-xs text-gray-500 mb-1 dark:text-gray-400">
                  {sender?.nickname}
                </Text>
              )}
              
              {/* Message bubble */}
              <View className={
                `rounded-lg px-3 py-2 ${
                  isCurrentUser 
                    ? 'bg-primary rounded-tr-sm' 
                    : 'bg-muted rounded-tl-sm'
                }`
              }>
                <Text className={`text-base ${isCurrentUser ? 'text-white' : 'text-black dark:text-white'}`}>
                  {item.content}
                </Text>
              </View>
              
              {/* Time stamp */}
              <Text className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                { time }
              </Text>
            </View>
      
            {/* Current user avatar */}
            {isCurrentUser && (
              <View className="ml-2 self-start">
                <View className="w-10 h-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
                  <Text className='text-lg font-extrabold text-foreground'>
                    { me?.nickname?.slice(0, 2) }
                  </Text>
                </View>
              </View>
            )}
          </View>

          {showDateSeparator && (
            <View className="my-4 flex-row items-center justify-center">
              <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
              <Text className="mx-4 text-sm text-gray-500 dark:text-gray-400">
                {date.toLocaleDateString(language, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
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
          keyExtractor={item => item.id.toString()}
          className="p-4 flex-1"
          inverted
          contentContainerStyle={{ 
            paddingTop: 60,
            paddingBottom: 30,
            flexGrow: 1,
            justifyContent: 'flex-end'
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">{t('noMessages')}</Text>
            </View>
          }
        />
  
        <View 
          className="absolute bottom-0 left-0 right-0 bg-background p-3 flex-row items-center border-t border-muted"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <TextInput
            className="flex-1 bg-muted rounded-full px-4 py-2 mr-2 dark:text-white"
            placeholder={t('message')}
            placeholderTextColor="#888"
            value={messageInput}
            onChangeText={setMessageInput}
          />
          <TouchableOpacity className="px-2" onPress={handleSendMessage} disabled={!messageInput.trim()}>
            <Monicon name="fa:send-o" size={26} color='#3d917c' />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }