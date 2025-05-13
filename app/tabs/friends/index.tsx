import { useRouter } from 'expo-router';
import { Search, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { UserBar } from '@/src/components/userBar';
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
  },
};

type Status = 'active' | 'away' | 'busy' | 'inactive';
const statusColors: Record<Status, string> = {
  active: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  inactive: 'bg-gray-400',
};

const groupChat = {
  id: 'group1',
  name: 'test groupchat',
  members: ['1', '2', '3'],
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

const friendRequests = [
  {
    name: 'Darrell Steward',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/852/200/200.jpg?hmac=4UHLpiS9j3YDnvq-w-MqnP5-ymiyvMs6BNV5ukoTRrI',
    },
    type: 'new' as const,
  },
  {
    name: 'Jane Doe',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/626/200/200.jpg?hmac=k-fpo_bQAtxcljtuQzE1GTq5YEufAV5jjzW3n86c0i0',
    },
    type: 'sent' as const,
  },
  {
    name: 'Guy Hawkins',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/764/200/200.jpg?hmac=g-JXLL-Box0-4IF64xLkh-OYHpc0kuCIXsRTuaqEPhQ',
    },
    type: 'sent' as const,
  },
  {
    name: 'John Doe',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/942/200/200.jpg?hmac=Gh7W-H3ZGmweB9STLwQvq-IHkxrVyawHVTKYxy-u9mA',
    },
    type: 'new' as const,
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
  const router = useRouter();
  const [selectedFriend, setSelectedFriend] = useState<(typeof friends)[number] | null>(null);

  const handleAddFriendPress = () => {
    router.push('tabs/friends/addFriend');
  };

  const handleProfilePress = (friend: (typeof friends)[number]) => {
    setSelectedFriend(friend);
  };

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
          <View className="relative my-4 w-full px-7">
            <InputText
              placeholder={t('search')}
              value={name}
              onChangeText={setName}
              className="rounded-2xl bg-field pl-12"
            />
            <View className="pointer-events-none absolute inset-y-0 left-7 top-2 flex items-center ps-3">
              <Search size={24} strokeWidth={3} color="#909597" />
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
          <View className="relative my-4 w-full px-7">
            <InputText
              placeholder={t('search')}
              value={name}
              onChangeText={setName}
              className="rounded-2xl bg-field pl-12"
            />
            <View className="pointer-events-none absolute inset-y-0 left-7 top-2 flex items-center ps-3">
              <Search size={24} strokeWidth={3} color="#909597" />
            </View>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 320 }}>
            <Text className="my-2 text-center text-muted-foreground">{t('newRequests')}</Text>
            {friendRequests.map(
              (request, index) =>
                request.type === 'new' && (
                  <UserBar
                    key={index}
                    name={request.name}
                    // imageSource={request.imageSource}
                    className="border-t border-muted">
                    <Button className="rounded-2xl" size="sm" variant="muted">
                      <Text className="text-destructive">{t('decline')}</Text>
                    </Button>
                    <Button className="rounded-2xl" size="sm">
                      <Text>{t('accept')}</Text>
                    </Button>
                  </UserBar>
                )
            )}
            <Text className="my-2 text-center text-muted-foreground">{t('sentRequests')}</Text>
            {friendRequests.map(
              (request, index) =>
                request.type === 'sent' && (
                  <UserBar
                    key={index}
                    name={request.name}
                    // imageSource={request.imageSource}
                    className="border-t border-muted">
                    <Button className="rounded-2xl" size="sm" variant="muted">
                      <Text className="text-destructive">{t('cancel')}</Text>
                    </Button>
                  </UserBar>
                )
            )}
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
