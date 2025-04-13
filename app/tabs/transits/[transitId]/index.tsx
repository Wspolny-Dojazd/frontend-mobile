import Monicon from '@monicon/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { $api } from '@/src/api/api';
import { useGroupErrorTranslations } from '@/src/api/errors/groups/groups';
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar';
import { Input } from '@/src/components/ui/input';
import { useAuth } from '@/src/context/authContext';
import { CustomMapView } from '@/src/features/map/CustomMapView';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { ChevronLeft, Plus, XCircle } from '@/src/lib/icons';
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

export default function App() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const { t: tErrors } = useGroupErrorTranslations();
  const { transitId } = useLocalSearchParams<{ transitId: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { token } = useAuth();

  const queryGroup = $api.useQuery(
    'get',
    '/api/groups/{id}',
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { path: { id: Number(transitId) } },
    },
    {
      refetchInterval: 1000,
    }
  );

  const queryMembers = $api.useQuery(
    'get',
    '/api/groups/{id}/members',
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { path: { id: Number(transitId) } },
    },
    {
      refetchInterval: 1000,
    }
  );

  const mutationLeaveGroup = $api.useMutation('post', '/api/groups/{id}/leave');

  const handleLeaveGroup = useCallback(() => {
    mutationLeaveGroup.mutate(
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { path: { id: Number(transitId) } },
      },
      {
        onSuccess(data, variables, context) {
          router.replace('/tabs/transits');
        },
        onError(error, variables, context) {
          // TODO: Show translated error
          Alert.alert(error?.code ?? 'Some error occurred');
        },
      }
    );
  }, [transitId, mutationLeaveGroup, token]);

  const mutationRemoveMember = $api.useMutation('post', '/api/groups/{id}/kick/{userId}');

  const handleRemoveMember = useCallback(
    (userId: string) => {
      mutationRemoveMember.mutate({
        headers: { Authorization: `Bearer ${token}` },
        params: { path: { id: Number(transitId), userId } },
      });
    },
    [transitId, mutationRemoveMember, token]
  );

  if (queryGroup.isLoading || queryMembers.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (queryGroup.error || queryMembers.error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>
          {queryGroup.error?.code && tErrors(queryGroup.error?.code)}
          {queryMembers.error?.code && tErrors(queryMembers.error?.code)}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="relative flex-1 p-4">
      <View className="relative mb-4 flex flex-row items-center justify-center">
        <TouchableOpacity
          onPress={() => router.replace('/tabs/transits')}
          className="absolute left-0 top-0">
          <ChevronLeft className="text-gray-400" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">
          {t('transit')} #{transitId}
        </Text>

        <Pressable onPress={handleLeaveGroup} className="absolute right-0 top-0">
          <Monicon name="iconamoon:exit-fill" size={24} color={theme.notification} />
        </Pressable>
      </View>

      <View className="mb-4 flex-row items-center justify-center gap-1 rounded-2xl bg-subtle py-2">
        <Text className="text-foreground">{t('joinTransit')}:</Text>
        <Text className="ml-2 text-xl font-bold text-foreground">#</Text>
        <Text className="text-foreground">{queryGroup.data?.joiningCode}</Text>
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
        {queryMembers.data?.map((member) => (
          <View key={member.id} className="mb-4 flex flex-row items-center justify-start">
            <Avatar className="h-10 w-10 rounded-full" alt={member.nickname}>
              <AvatarImage source={{ uri: 'https://via.placeholder.com/150' }} />
              <AvatarFallback>
                <Text className="text-lg text-foreground">
                  {member.nickname.charAt(0) + member.nickname.charAt(1)}
                </Text>
              </AvatarFallback>
            </Avatar>

            <Text className="ml-2 mr-auto text-lg text-foreground">{member.nickname}</Text>

            <Pressable
              className="ml-2 flex h-8 w-8 items-center justify-center"
              onPress={() => handleRemoveMember(member.id)}>
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
