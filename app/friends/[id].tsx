import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';

type Message = {
  id: number;
  text: string;
  time: string;
  isSent: boolean;
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
  const renderMessage = ({ item }: { item: Message }) => (
    <View className={`w-full ${item.isSent ? 'items-end' : 'items-start'} mb-3`}>
      <View className={
        `max-w-[80%] rounded-lg p-3 ${
          item.isSent 
            ? 'bg-primary rounded-tr-sm' 
            : 'bg-muted rounded-tl-sm'
        }`
      }>
        <Text className={`text-base ${item.isSent ? 'text-white' : 'text-black dark:text-white'}`}>
          {item.text}
        </Text>
        <Text className={`text-xs ${item.isSent ? 'text-blue-100' : 'text-gray-500'} mt-1`}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={mockMessages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        className="p-4 flex-1"
        contentContainerStyle={{ 
          paddingBottom: 80,
          flexGrow: 1,
          justifyContent: 'flex-start'
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">No messages found</Text>
          </View>
        }
      />

      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-gray-200 p-3 flex-row items-center">
        <TextInput
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2"
          placeholder="Type a message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity className="bg-blue-500 px-5 py-2 rounded-full">
          <Text className="text-white font-semibold">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}