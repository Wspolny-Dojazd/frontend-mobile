import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image
  } from 'react-native';
  import Monicon from '@monicon/native';
  import { useRouter, useLocalSearchParams } from 'expo-router';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
  
  const NAMESPACE = 'app/tabs/friends/[id]';
  const TRANSLATIONS = {
    en: {
      transit: 'During transit',
      active: 'Active now',
      message: 'Type a message...',
    },
    pl: {
      transit: 'W trakcie przejazdu',
      active: 'Aktywny/a teraz',
      message: 'Napisz wiadomość...',
    },
  };
  
  type Friend = {
    id: number;
    name: string;
    imageSource: {
      uri: string;
    };
  };
  
  type Message = {
    id: number;
    text: string;
    time: string;
    senderId: number;
  };
  
  type ChatParams = {
    id: string;
    name: string;
    chatType: 'private' | 'group';
    members?: string;
  };
  
  // Mock data
  const mockUser = {
    id: 1,
    name: 'You',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/852/200/200.jpg?hmac=4UHLpiS9j3YDnvq-w-MqnP5-ymiyvMs6BNV5ukoTRrI',
    },
  };
  const mockFriend = {
    id: 2,
    name: 'John Cooper',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/1077/200/200.jpg?hmac=hiq7UCoz9ZFgr9HcMCpbnKhV-IMyOJqsQtVFyqmqohQ',
    },
  };
  
  const mockGroupMembers: Friend[] = [
    {
      id: 2,
      name: 'Kristin Watson',
      imageSource: {
        uri: 'https://fastly.picsum.photos/id/1077/200/200.jpg?hmac=hiq7UCoz9ZFgr9HcMCpbnKhV-IMyOJqsQtVFyqmqohQ',
      }
    },
    {
      id: 3,
      name: 'Darrell Steward',
      imageSource: {
        uri: 'https://fastly.picsum.photos/id/277/200/200.jpg?hmac=zlHjTbiytnfBWurpKXXSvMRzVSmkgW13o4K7Q-08r68',
      }
    },
    {
      id: 4,
      name: 'Guy Hawkins',
      imageSource: {
        uri: 'https://fastly.picsum.photos/id/231/200/200.jpg?hmac=lUSm6Na5VxIhLKub6Y3JaBOAwCjkimAi-zHEOInwL58',
      }
    }
  ];
  
  const mockMessages: Message[] = [
    { id: 1, text: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', time: '9:41', senderId: 1 },
    { id: 2, text: 'Sure! Thank you', time: '12:03', senderId: 2 },
    { id: 3, text: 'Could you please ask the restaurant to give me cutlery? I just need these items.', time: '12:03', senderId: 3 },
    { id: 4, text: 'Yes, let me tell the restaurant.', time: '12:04', senderId: 4 },
    { id: 5, text: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', time: '9:41', senderId: 1 },
    { id: 6, text: 'Sure! Thank you', time: '12:03', senderId: 2 },
    { id: 7, text: 'Could you please ask the restaurant to give me cutlery? I just need these items.', time: '12:03', senderId: 3 },
    { id: 8, text: 'Yes, let me tell the restaurant.', time: '12:04', senderId: 4 },
    { id: 9, text: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', time: '9:41', senderId: 1 },
    { id: 10, text: 'Sure! Thank you', time: '12:03', senderId: 2 },
    { id: 11, text: 'Could you please ask the restaurant to give me cutlery? I just need these items.', time: '12:03', senderId: 3 },
    { id: 12, text: 'Yes, let me tell the restaurant.', time: '12:04', senderId: 4 },
    { id: 13, text: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', time: '9:41', senderId: 1 },
    { id: 14, text: 'Sure! Thank you', time: '12:03', senderId: 2 },
    { id: 15, text: 'Could you please ask the restaurant to give me cutlery? I just need these items.', time: '12:03', senderId: 3 },
    { id: 16, text: 'Yes, let me tell the restaurant.', time: '12:04', senderId: 4 },
  ];
  
  export default function ChatScreen() {
    const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
    const router = useRouter();
    
    const params = useLocalSearchParams<ChatParams>();
    const members = params.chatType === 'group' 
    ? mockGroupMembers 
    : [];
  
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
                <Image
                  source={{ uri: members[0]?.imageSource?.uri }}
                  className="w-10 h-10 rounded-full border-2 border-background"
                />
                {members.length >= 2 && (
                  <Image
                    source={{ uri: members[1]?.imageSource?.uri }}
                    className="absolute -right-3 -bottom-3 w-10 h-10 rounded-full border-2 border-background"
                    style={{ zIndex: 1 }}
                  />
                )}
              </View>
              {members.length > 2 && (
                <Text className="text-gray-500 text-sm">+{members.length - 2}</Text>
              )}
            </View>
          ) : (
            <Image
              source={{ uri: mockFriend.imageSource.uri }}
              className="w-10 h-10 rounded-full mr-4"
            />
          )}
          <View>
            <Text className="text-xl font-semibold text-black dark:text-white">
              {params.name || 'Chat'}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {params.chatType === 'group' 
                ? t('transit')
                : t('active')}
            </Text>
          </View>
        </View>
  
        <TouchableOpacity className="p-2">
          <Monicon name="tabler:location-filled" size={28} color="#3d917c" />
        </TouchableOpacity>
      </View>
    );
  
    const renderMessage = ({ item }: { item: Message }) => {
      const isCurrentUser = item.senderId === mockUser.id;
      const sender = params.chatType === 'private'
      ? (item.senderId !== mockUser.id ? mockFriend : null) // For private chats, use mockFriend
      : mockGroupMembers.find(f => f.id === item.senderId); // For groups, find in members
  
      return (
        <View className={`w-full flex-row ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
          {/* Sender's avatar */}
          {!isCurrentUser && sender && (
            <View className="mr-2 self-start">
              <Image
                source={sender.imageSource}
                className="w-10 h-10 rounded-full"
              />
            </View>
          )}
  
          {/* Message container */}
          <View className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            {/* Sender name for group chats */}
            {params.chatType === 'group' && !isCurrentUser && (
              <Text className="text-xs text-gray-500 mb-1">
                {sender?.name}
              </Text>
            )}
            
            {/* Message bubble */}
            <View className={
              `rounded-lg p-3 ${
                isCurrentUser 
                  ? 'bg-primary rounded-tr-sm' 
                  : 'bg-muted rounded-tl-sm'
              }`
            }>
              <Text className={`text-base ${isCurrentUser ? 'text-white' : 'text-black dark:text-white'}`}>
                {item.text}
              </Text>
            </View>
            
            {/* Time stamp */}
            <Text className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
              {item.time}
            </Text>
          </View>
    
          {/* Current user avatar */}
          {isCurrentUser && (
            <View className="ml-2 self-start">
              <Image
                source={mockUser.imageSource}
                className="w-10 h-10 rounded-full"
              />
            </View>
          )}
        </View>
      );
    };
  
    return (
      <SafeAreaView className="flex-1 bg-background">
        {renderHeader()}
  
         {/* Chat */}
         <FlatList
          data={mockMessages.slice().reverse()}
          renderItem={renderMessage}
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
              <Text className="text-gray-500">No messages found</Text>
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
            className="flex-1 bg-muted rounded-full px-4 py-2 mr-2"
            placeholder={t('message')}
            placeholderTextColor="#888"
          />
          <TouchableOpacity className="px-2">
            <Monicon name="fa:send-o" size={26} color='#3d917c' />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }