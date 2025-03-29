import { router } from 'expo-router';
import { Search, ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/button';
import { InputText } from '@/src/components/ui/inputText';
import { Text } from '@/src/components/ui/text';
import { UserBar } from '@/src/components/userBar';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'app/add-friends/index';
const TRANSLATIONS = {
  en: {
    title: 'Invite friends',
    search: 'Search username',
    invite: 'Invite',
    sent: 'Sent',
  },
  pl: {
    title: 'Dodaj znajomego',
    search: 'Wyszukaj nazwę',
    invite: 'Zaproś',
    sent: 'Wysłano',
  },
};

const initialUsers = [
  {
    name: 'Username1',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/852/200/200.jpg?hmac=4UHLpiS9j3YDnvq-w-MqnP5-ymiyvMs6BNV5ukoTRrI',
    },
    invited: false,
  },
  {
    name: 'Username12',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/626/200/200.jpg?hmac=k-fpo_bQAtxcljtuQzE1GTq5YEufAV5jjzW3n86c0i0',
    },
    invited: false,
  },
  {
    name: 'Username123',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/764/200/200.jpg?hmac=g-JXLL-Box0-4IF64xLkh-OYHpc0kuCIXsRTuaqEPhQ',
    },
    invited: false,
  },
  {
    name: 'Username1234',
    imageSource: {
      uri: 'https://fastly.picsum.photos/id/942/200/200.jpg?hmac=Gh7W-H3ZGmweB9STLwQvq-IHkxrVyawHVTKYxy-u9mA',
    },
    invited: false,
  },
];

export default function AddFriendView() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const [name, setName] = useState('');
  const [users, setUsers] = useState(initialUsers);

  const handleSendRequest = (index: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user, i) => (i === index ? { ...user, invited: true } : user))
    );
  };

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
          value={name}
          onChangeText={setName}
          className="rounded-2xl bg-field pl-12"
        />
        <View className="pointer-events-none absolute inset-y-0 left-7 top-2 flex items-center ps-3">
          <Search size={24} strokeWidth={3} color="#909597" />
        </View>
      </View>

      <ScrollView>
        {users.map((user, index) => (
          <UserBar key={index} name={user.name} imageSource={user.imageSource}>
            <Button
              className="min-w-24 rounded-2xl"
              size="sm"
              variant={user.invited ? 'muted' : 'default'}
              disabled={user.invited}
              onPress={() => handleSendRequest(index)}>
              <Text>{t(user.invited ? 'sent' : 'invite')}</Text>
            </Button>
          </UserBar>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
