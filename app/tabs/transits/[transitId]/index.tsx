import Monicon from '@monicon/native';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState, memo } from 'react';
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

import { useCoordinateContext } from './_layout';

import { $api } from '@/src/api/api';
import { useGroupErrorTranslations } from '@/src/api/errors/groups/groups';
import DateTimeInput from '@/src/components/DateTimeInput';
import { Input } from '@/src/components/ui/input';
import { useAuth } from '@/src/context/authContext';
import { CustomMapView } from '@/src/features/map/CustomMapView';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { ChevronLeft, Plus, XCircle } from '@/src/lib/icons';
import { useTheme } from '@/src/lib/useTheme';
import { cn } from '@/src/lib/utils';

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

interface MembersListProps {
  groupId: string;
  handleRemoveMember: (userId: string) => void;
  inviteText: string;
  invitingEnabled: boolean;
}

const MembersList = memo(
  ({ groupId, handleRemoveMember, inviteText, invitingEnabled }: MembersListProps) => {
    const { token } = useAuth();
    const { data: members } = $api.useQuery('get', '/api/groups/{id}/members', {
      headers: { Authorization: `Bearer ${token}` },
      params: { path: { id: Number(groupId) } },
    });

    const { data: me } = $api.useQuery('get', '/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const isUserCreator = members?.find((member) => member.id === me?.id)?.isCreator;

    return (
      <ScrollView>
        {members?.map((member) => (
          <View key={member.id} className="mb-4 flex flex-row items-center justify-start gap-4">
            <View
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900',
                member.id === me?.id && 'bg-primary'
              )}>
              <Text
                className={cn(
                  'text-lg font-extrabold text-foreground',
                  member.id === me?.id && 'text-primary-foreground'
                )}>
                {member.nickname.charAt(0) + member.nickname.charAt(1)}
              </Text>
              {member.isCreator && (
                <View
                  className={cn(
                    'absolute -right-2 -top-2 flex items-center justify-center rounded-full border border-[#FFD700] bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-900'
                  )}>
                  <Monicon name="streamline:crown-solid" size={12} color="#FFD700" />
                </View>
              )}
            </View>

            <View className="flex flex-row items-center justify-center gap-2">
              <Text className="text-lg text-foreground">{member.nickname}</Text>
            </View>

            {/* {member.location && (
            <Text className="ml-2 mr-auto text-sm text-muted-foreground">
              {member.location.latitude.toFixed(6)}, {member.location.longitude.toFixed(6)}
            </Text>
          )} */}

            {isUserCreator && !member.isCreator && member.id !== me?.id && (
              <Pressable
                className="ml-auto flex h-8 w-8 items-center justify-center"
                onPress={() => handleRemoveMember(member.id)}>
                <XCircle className="text-gray-400" />
              </Pressable>
            )}
          </View>
        ))}

        {invitingEnabled && (
          <Pressable className="mb-4 flex flex-row items-center justify-start">
            <View className="flex h-10 w-10 items-center justify-center rounded-full bg-subtle">
              <Plus className="text-primary" />
            </View>
            <Text className="ml-2 text-lg text-primary">{inviteText}</Text>
          </Pressable>
        )}
      </ScrollView>
    );
  }
);

export default function TransitGroup() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const { t: tErrors } = useGroupErrorTranslations();
  const { transitId } = useLocalSearchParams<{ transitId: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const { destinationCoordinate } = useCoordinateContext();

  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [dateTimeISO, setDateTimeISO] = useState<string>(new Date().toISOString());

  const handleDateTimeChange = useCallback((date: Date, dateIso: string) => {
    setSelectedDateTime(date);
    setDateTimeISO(dateIso);
  }, []);

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

  const queryClient = useQueryClient();

  const mutationFindPaths = $api.useMutation('post', '/api/groups/{groupId}/paths');

  const handleFindPaths = useCallback(() => {
    if (!destinationCoordinate) {
      Alert.alert('Please select a destination first');
      return;
    }

    if (!queryMembers.data) {
      Alert.alert('No members found');
      return;
    }

    if (!queryMembers.data.every((member) => member.location)) {
      Alert.alert('Not every member has a location');
      return;
    }

    mutationFindPaths.mutate(
      {
        body: {
          arrivalTime: dateTimeISO,
          destinationLatitude: destinationCoordinate.latitude,
          destinationLongitude: destinationCoordinate.longitude,
          userLocations: queryMembers.data.map((member) => ({
            userId: member.id,
            latitude: member.location!.latitude,
            longitude: member.location!.longitude,
          })),
        },
        headers: { Authorization: `Bearer ${token}` },
        params: { path: { groupId: Number(transitId) } },
      },
      {
        onSettled(data, error, variables, context) {
          queryClient.invalidateQueries({ queryKey: ['get', '/api/groups/{groupId}/paths'] });
        },
        onSuccess(data, variables, context) {
          router.push(`/tabs`);
        },
      }
    );
  }, [transitId, mutationFindPaths, token, dateTimeISO, destinationCoordinate, queryMembers.data]);

  const queryPaths = $api.useQuery('get', '/api/groups/{groupId}/paths', {
    headers: { Authorization: `Bearer ${token}` },
    params: { path: { groupId: Number(transitId) } },
  });

  const queryAcceptedPath = $api.useQuery('get', '/api/groups/{groupId}/paths/accepted', {
    headers: { Authorization: `Bearer ${token}` },
    params: { path: { groupId: Number(transitId) } },
  });

  const isPathAccepted = !!queryAcceptedPath.data;
  const destinationName = queryAcceptedPath.data?.paths
    ?.at(0)
    ?.segments?.at(-1)
    ?.stops?.at(-1)?.name;

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

      <Pressable
        disabled={isPathAccepted}
        onPress={() => router.push(`/tabs/transits/${transitId}/chooseDestination`)}>
        <Input
          containerClassName="mb-4"
          readOnly
          value={
            isPathAccepted
              ? destinationName
              : destinationCoordinate
                ? `Lat: ${destinationCoordinate.latitude.toFixed(6)}, Lng: ${destinationCoordinate.longitude.toFixed(6)}`
                : 'Select destination'
          }
          leftSection={<Monicon name="uil:map-marker" size={24} color={theme.text} />}
          rightSection={
            !isPathAccepted && <Monicon name="circum:edit" size={24} color={theme.text} />
          }
        />
      </Pressable>

      <DateTimeInput
        selectedDateTime={selectedDateTime}
        onDateTimeChange={handleDateTimeChange}
        disabled={isPathAccepted}
      />

      <Pressable
        disabled={isPathAccepted}
        className="mb-4 h-[200px] w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800"
        onPress={() => router.push(`/tabs/transits/${transitId}/chooseDestination`)}>
        <CustomMapView
          region={{
            latitude: destinationCoordinate?.latitude || 52.231958,
            longitude: destinationCoordinate?.longitude || 21.006725,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}>
          {destinationCoordinate && (
            <Marker
              coordinate={{
                latitude: destinationCoordinate.latitude,
                longitude: destinationCoordinate.longitude,
              }}
            />
          )}
        </CustomMapView>
      </Pressable>

      <Text className="mb-4 text-lg font-bold text-foreground">{t('groupMembers')}</Text>

      <MembersList
        groupId={transitId}
        handleRemoveMember={handleRemoveMember}
        inviteText={t('inviteToGroup')}
        invitingEnabled={!isPathAccepted}
      />

      {!isPathAccepted && (
        <Pressable
          disabled={mutationFindPaths.isPending}
          className="mb-4 flex flex-row items-center justify-center rounded-2xl bg-primary py-4"
          onPress={handleFindPaths}>
          {mutationFindPaths.isPending ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
              {/* TODO: Add to dictionary */}
              <Text className="text-lg font-semibold text-white">Wait...</Text>
            </View>
          ) : (
            <>
              {queryPaths.data?.length && queryPaths.data.length > 0 ? (
                // TODO: Add to dictionary
                <Text className="text-lg text-white">Find again</Text>
              ) : (
                <Text className="text-lg text-white">{t('findRoute')}</Text>
              )}
            </>
          )}
        </Pressable>
      )}

      <Pressable
        onPress={() => router.push(`/tabs/transits/${transitId}/chat`)}
        className="absolute bottom-32 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
        <Monicon name="bi:chat-square-text" size={24} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}
