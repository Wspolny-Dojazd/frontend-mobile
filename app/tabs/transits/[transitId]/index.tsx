import FontAwesome from '@expo/vector-icons/FontAwesome';
import Monicon from '@monicon/native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { $api } from '@/src/api/api';
import { useGroupErrorTranslations } from '@/src/api/errors/groups/groups';
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar';
import { Input } from '@/src/components/ui/input';
import { useAuth } from '@/src/context/authContext';
import { CustomMapView } from '@/src/features/map/CustomMapView';
import { SearchLocationView, Coordinate } from '@/src/features/map/SearchLocationView';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { ChevronRight, ChevronLeft, Plus, XCircle } from '@/src/lib/icons';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';
import { useTheme } from '@/src/lib/useTheme';

const NAMESPACE = 'app/tabs/transits/[transitId]';
const TRANSLATIONS = {
  en: {
    transit: 'Transit',
    chooseDateAndTime: 'Choose Date and Time',
    groupMembers: 'Group Members',
    inviteToGroup: 'Invite to group',
    findRoute: 'Find Route',
    joinTransit: 'Join Transit',
  },
  pl: {
    transit: 'Przejazd',
    chooseDateAndTime: 'Wybierz datę i godzinę',
    groupMembers: 'Członkowie grupy',
    inviteToGroup: 'Zaproś do grupy',
    findRoute: 'Wyznacz trasę',
    joinTransit: 'Kod dołączenia',
  },
};

const MEMBERS = [
  {
    id: 1,
    name: 'John Doe',
    avatar: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    name: 'Jane Doe',
    avatar: 'https://via.placeholder.com/150',
  },
];

export default function App() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const { transitId } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView className="relative flex-1 p-4">
      <View className="relative mb-4 flex flex-row items-center justify-center">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-0 top-0">
          <ChevronLeft className="text-gray-400" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">
          {t('transit')} #{transitId}
        </Text>

        <Pressable className="absolute right-0 top-0">
          <Monicon name="iconamoon:exit-fill" size={24} color={theme.notification} />
        </Pressable>
      </View>

      <View className="mb-4 flex-row items-center justify-center gap-1 rounded-2xl bg-subtle py-2">
        <Text className="text-foreground">{t('joinTransit')}:</Text>
        <Text className="ml-2 text-xl font-bold text-foreground">#</Text>
        <Text className="text-foreground">315 846</Text>
      </View>

      <Pressable onPress={() => router.push(`/tabs/transits/${transitId}/chooseDestination`)}>
        <Input
          containerClassName="mb-4"
          readOnly
          value="Pałac Kultury i Nauki"
          leftSection={<Monicon name="uil:map-marker" size={24} color={theme.text} />}
          rightSection={<Monicon name="circum:edit" size={24} color={theme.text} />}
        />
      </Pressable>

      <Input
        containerClassName="mb-4"
        readOnly
        value={t('chooseDateAndTime')}
        leftSection={<Monicon name="famicons:calendar-sharp" size={24} color={theme.text} />}
        rightSection={<Monicon name="circum:edit" size={24} color={theme.text} />}
      />

      <Pressable
        className="mb-4 h-[200px] w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800"
        onPress={() => router.push(`/tabs/transits/${transitId}/chooseDestination`)}>
        <CustomMapView
          region={{
            latitude: 52.231958,
            longitude: 21.006725,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}>
          <Marker coordinate={{ latitude: 52.231958, longitude: 21.006725 }} />
        </CustomMapView>
      </Pressable>

      <Text className="mb-4 text-lg font-bold text-foreground">{t('groupMembers')}</Text>

      <ScrollView>
        {MEMBERS.map((member) => (
          <View key={member.id} className="mb-4 flex flex-row items-center justify-start">
            <Avatar className="h-10 w-10 rounded-full" alt={member.name}>
              <AvatarImage source={{ uri: member.avatar }} />
              <AvatarFallback>
                <Text className="text-lg text-foreground">{member.name.charAt(0)}</Text>
              </AvatarFallback>
            </Avatar>

            <Text className="ml-2 mr-auto text-lg text-foreground">{member.name}</Text>

            <Pressable className="ml-2 flex h-8 w-8 items-center justify-center">
              <XCircle className="text-gray-400" />
            </Pressable>
          </View>
        ))}

        <Pressable className="mb-4 flex flex-row items-center justify-start">
          <View className="flex h-10 w-10 items-center justify-center rounded-full bg-subtle">
            <Plus className="text-primary" />
          </View>
          <Text className="ml-2 text-lg text-primary">{t('inviteToGroup')}</Text>
        </Pressable>
      </ScrollView>

      <Pressable className="mb-4 flex flex-row items-center justify-center rounded-2xl bg-primary py-4">
        <Text className="text-lg text-white">{t('findRoute')}</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push(`/tabs/transits/${transitId}/chat`)}
        className="absolute bottom-32 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
        <Monicon name="bi:chat-square-text" size={24} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}
