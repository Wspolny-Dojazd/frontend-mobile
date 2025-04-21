import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  LayoutChangeEvent,
  Image
} from 'react-native';
import Monicon from '@monicon/native';

type Message = {
  id: number;
  text: string;
  time: string;
  isSent: boolean;
};

// Mock user data
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

const mockMessages: Message[] = [
  { id: 1, text: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', time: '9:41', isSent: false },
  { id: 2, text: 'Sure! Thank you', time: '12:03', isSent: true },
  { id: 3, text: 'Could you please ask the restaurant to give me cutlery? I just need these items.', time: '12:03', isSent: true },
  { id: 4, text: 'Yes, let me tell the restaurant.', time: '12:04', isSent: false },
  { id: 5, text: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', time: '9:41', isSent: false },
  { id: 6, text: 'Sure! Thank you', time: '12:03', isSent: true },
  { id: 7, text: 'Could you please ask the restaurant to give me cutlery? I just need these items.', time: '12:03', isSent: true },
  { id: 8, text: 'Yes, let me tell the restaurant.', time: '12:04', isSent: false },
  { id: 9, text: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', time: '9:41', isSent: false },
  { id: 10, text: 'Sure! Thank you', time: '12:03', isSent: true },
  { id: 11, text: 'Could you please ask the restaurant to give me cutlery? I just need these items.', time: '12:03', isSent: true },
  { id: 12, text: 'Yes, let me tell the restaurant.', time: '12:04', isSent: false },
  { id: 13, text: 'Hi, the restaurant is quite busy now so the delivery may be late 15 mins. Please wait for me.', time: '9:41', isSent: false },
  { id: 14, text: 'Sure! Thank you', time: '12:03', isSent: true },
  { id: 15, text: 'Could you please ask the restaurant to give me cutlery? I just need these items.', time: '12:03', isSent: true },
  { id: 16, text: 'Yes, let me tell the restaurant.', time: '12:04', isSent: false },
];

export default function ChatScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [inputHeight, setInputHeight] = useState(0);

  const handleInputLayout = (event: LayoutChangeEvent) => {
    setInputHeight(event.nativeEvent.layout.height); // Now properly typed
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: false });
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 300);
  }, []);

  // Auto-scroll to bottom on mount
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  const renderMessage = ({ item }: { item: Message }) => (
    <View className={`w-full flex-row ${item.isSent ? 'justify-end' : 'justify-start'} mb-3`}>
      {/* Friend's avatar (left side) */}
      {!item.isSent && (
        <View className="mr-2 self-start">
          <Image
            source={mockFriend.imageSource}
            className="w-10 h-10 rounded-full"
          />
        </View>
      )}
  
      {/* Message container */}
      <View className={`max-w-[70%] ${item.isSent ? 'items-end' : 'items-start'}`}>
        {/* Message bubble */}
        <View className={
          `rounded-lg p-3 ${
            item.isSent 
              ? 'bg-primary rounded-tr-sm' 
              : 'bg-muted rounded-tl-sm'
          }`
        }>
          <Text className={`text-base ${item.isSent ? 'text-white' : 'text-black dark:text-white'}`}>
            {item.text}
          </Text>
        </View>
        
        {/* Time stamp */}
        <Text className={`text-xs text-gray-500 mt-1 ${item.isSent ? 'text-right' : 'text-left'}`}>
          {item.time}
        </Text>
      </View>
  
      {/* User's avatar (right side) */}
      {item.isSent && (
        <View className="ml-2 self-start">
          <Image
            source={mockUser.imageSource}
            className="w-10 h-10 rounded-full"
          />
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
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
        onLayout={handleInputLayout}
      >
        <TextInput
          className="flex-1 bg-muted rounded-full px-4 py-2 mr-2"
          placeholder="Type a message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity className="pr-2">
          <Monicon name="circum:edit" size={36} color='#3d917c' />
        </TouchableOpacity>
      </View>
    </View>
  );
}