import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ToastAndroid } from 'react-native';

import { $api } from '@/src/api/api';
import { useGroupErrorTranslations } from '@/src/api/errors/groups/groups';
import { useAuth } from '@/src/context/authContext';
import { NavigationView } from '@/src/features/map/NavigationView';
import { Coordinate, SearchLocationView } from '@/src/features/map/SearchLocationView';
import UserLocationMarker from '@/src/features/map/UserLocationMarker';
import useLiveLocation from '@/src/features/map/useLiveLocation';

export default function App() {
  const router = useRouter();
  const { token } = useAuth();
  const queryGroups = $api.useQuery('get', '/api/groups', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const currentGroup = queryGroups.data?.at(0);

  const { data: me } = $api.useQuery('get', '/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const mutationCreateGroup = $api.useMutation('post', '/api/groups');

  const { t: tGroupError } = useGroupErrorTranslations();

  const { location } = useLiveLocation();

  const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | null>(null);

  const createGroup = useCallback(() => {
    if (!selectedCoordinate) {
      return;
    }

    mutationCreateGroup.mutate(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      {
        onSuccess: (data) => {
          queryGroups.refetch();
          router.push(
            `/tabs/transits/${data.id}?latitude=${selectedCoordinate?.latitude}&longitude=${selectedCoordinate?.longitude}`
          );
        },
        onError: (error) => {
          ToastAndroid.show(tGroupError(error.code), ToastAndroid.SHORT);
        },
      }
    );
  }, [mutationCreateGroup, token, queryGroups, selectedCoordinate]);

  if (currentGroup) {
    return <NavigationView groupId={currentGroup.id} />;
  }

  return (
    <SearchLocationView
      selectedCoordinate={selectedCoordinate}
      setSelectedCoordinate={setSelectedCoordinate}
      mapComponents={
        location &&
        me && (
          <UserLocationMarker
            latitude={location.coords.latitude}
            longitude={location.coords.longitude}
            userName={me.nickname}
            isSelected={false}
          />
        )
      }
      onAccept={createGroup}
    />
  );
}
