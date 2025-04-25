import { useDebouncedState } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import MapView, { Details, Region } from 'react-native-maps';

import { MapPath } from './MapPath';
import { NavigationBottomSheet } from './NavigationBottomSheet';
import { PathOptions } from './PathOptions';
import UserLocationMarker from '../UserLocationMarker';
import { UserPathOptions } from './UserPathOptions';

import { $api } from '@/src/api/api';
import { useAuth } from '@/src/context/authContext';
import { CustomMapView } from '@/src/features/map/CustomMapView';
import { LocationButton } from '@/src/features/map/LocationButton';
import { useLocation } from '@/src/features/map/useLocation';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';

const NAMESPACE = 'src/features/map/NavigationView';
const TRANSLATIONS = {
  en: {
    acceptPath: 'Accept path',
    acceptingPath: 'Accepting path...',
  },
  pl: {
    acceptPath: 'Akceptuj trasę',
    acceptingPath: 'Akceptowanie trasy...',
  },
};

type NavigationViewProps = {
  groupId: number;
};

// Threshold for showing detailed stops on the map
const DELTA_THRESHOLD = 0.24;

type MemberMarkersProps = {
  groupId: number;
  selectedUserId: string | null;
};

const MemberMarkers = React.memo(({ groupId, selectedUserId }: MemberMarkersProps) => {
  const { token } = useAuth();

  const { data: members } = $api.useQuery(
    'get',
    '/api/groups/{id}/members',
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { path: { id: groupId } },
    },
    {
      enabled: !!token,
      refetchInterval: 1000,
    }
  );

  return members?.map(
    (member) =>
      member.location && (
        <UserLocationMarker
          key={member.id}
          latitude={member.location?.latitude}
          longitude={member.location?.longitude}
          userName={member.nickname}
          isSelected={member.id === selectedUserId}
        />
      )
  );
});

MemberMarkers.displayName = 'MemberMarkers'; // Helpful for debugging

export const NavigationView = ({ groupId }: NavigationViewProps) => {
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
  const { colorScheme } = useColorScheme();
  const mapRef = useRef<MapView>(null);

  const { errorMsg, isLocating, isMapCentered, handleMapChange, handleCenterOnUser } = useLocation({
    mapRef,
  });

  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

  const { token } = useAuth();

  const { data: user } = $api.useQuery('get', '/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const queryProposedPaths = $api.useQuery(
    'get',
    '/api/groups/{groupId}/paths',
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { path: { groupId } },
    },
    {
      enabled: !!token,
      refetchInterval: 5000,
    }
  );

  const queryAcceptedPath = $api.useQuery(
    'get',
    '/api/groups/{groupId}/paths/accepted',
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { path: { groupId } },
    },
    {
      enabled: !!token,
      refetchInterval: 5000,
    }
  );

  const isPathAccepted = useMemo(
    () => queryAcceptedPath.data !== undefined,
    [queryAcceptedPath.data]
  );

  const mutationAcceptPath = $api.useMutation(
    'post',
    '/api/groups/{groupId}/paths/{pathId}/accept'
  );

  const queryClient = useQueryClient();

  const handleAcceptPath = useCallback(() => {
    if (selectedPathId) {
      mutationAcceptPath.mutate(
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { path: { groupId, pathId: selectedPathId } },
        },
        {
          onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
              queryKey: ['get', '/api/groups/{groupId}/paths/accepted'],
            });
          },
        }
      );
    }
  }, [mutationAcceptPath, token, groupId, selectedPathId]);

  // const members = useMembers(groupId);

  useEffect(() => {
    if (queryProposedPaths.data && queryProposedPaths.data.length > 0) {
      setSelectedPathId(queryProposedPaths.data.at(0)!.id);
    }
  }, [queryProposedPaths.data]);

  const initialRegion = useMemo(
    () => ({
      latitude: 52.237049,
      longitude: 21.017532,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    []
  );

  const [showDetailedStops, setShowDetailedStops] = useDebouncedState(
    initialRegion.latitudeDelta < DELTA_THRESHOLD,
    100
  );

  const handleRegionChangeComplete = useCallback(
    (region: Region, _details: Details) => {
      setShowDetailedStops(region.latitudeDelta < DELTA_THRESHOLD);
    },
    [setShowDetailedStops]
  );

  const proposedPaths = useMemo(() => queryProposedPaths.data || [], [queryProposedPaths.data]);

  const selectedPathOption = useMemo(() => {
    if (queryAcceptedPath.data) {
      return queryAcceptedPath.data;
    }
    if (!selectedPathId || proposedPaths.length === 0) return null;
    return proposedPaths.find((path) => path.id === selectedPathId) || null;
  }, [selectedPathId, proposedPaths, queryAcceptedPath.data]);

  const usersPaths = useMemo(() => {
    if (selectedPathOption) {
      return selectedPathOption.paths;
    }

    return null;

    // Fallback to mock data if no path is selected or available
    // return proposedPaths.length > 0 ? proposedPaths[0].paths : MOCK_PATHS[0]?.paths || [];
    // return MOCK_PATHS[0]!.paths;
  }, [selectedPathOption, proposedPaths]);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(user?.id ?? null);

  const selectedUserPath = useMemo(() => {
    if (!selectedUserId) return null;
    return usersPaths?.find((path) => path.userId === selectedUserId) ?? null;
  }, [usersPaths, selectedUserId]);

  const userPathsComponents = useMemo(() => {
    return usersPaths?.map((path) => (
      <MapPath
        key={`map-path-${path.userId}`}
        path={path}
        showDetailedStops={showDetailedStops}
        muted={path.userId !== selectedUserId}
      />
    ));
  }, [usersPaths, showDetailedStops, selectedUserId]);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);

  const handleSelectPathOption = useCallback(
    (pathId: string) => {
      setSelectedPathId(pathId);
      // Reset selected user when changing path option
      const newPathOption = proposedPaths.find((path) => path.id === pathId);
      if (newPathOption && newPathOption.paths.length > 0 && user?.id) {
        setSelectedUserId(user.id);
      } else {
        setSelectedUserId(null);
      }
    },
    [proposedPaths, user?.id]
  );

  return (
    <>
      <CustomMapView
        ref={mapRef}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        onRegionChangeComplete={handleMapChange}
        showsCompass={false}
        onRegionChange={handleRegionChangeComplete}>
        {userPathsComponents}
        <MemberMarkers groupId={groupId} selectedUserId={selectedUserId} />
      </CustomMapView>

      {/* TODO: This should be like on mockups */}
      <View className="absolute left-0 right-0 top-0 mx-8 mt-12 shadow-lg">
        {!isPathAccepted && proposedPaths.length > 0 && (
          <PathOptions
            proposedPaths={proposedPaths}
            selectedPathId={selectedPathId}
            onSelectPath={handleSelectPathOption}
          />
        )}

        {usersPaths && usersPaths.length > 0 && (
          <UserPathOptions
            usersPaths={usersPaths}
            groupId={groupId}
            selectedUserId={selectedUserId}
            onSelectUser={handleSelectUser}
          />
        )}
      </View>

      <LocationButton
        isLocating={isLocating}
        isMapCentered={isMapCentered}
        errorMsg={errorMsg}
        colorScheme={colorScheme}
        onPress={handleCenterOnUser}
        className="absolute bottom-44 right-5"
      />

      {!queryProposedPaths.isLoading &&
        !queryAcceptedPath.isLoading &&
        queryProposedPaths.data !== undefined &&
        queryProposedPaths.data.length > 0 &&
        selectedPathId !== null &&
        !isPathAccepted && (
          <Pressable
            className="absolute bottom-28 left-0 right-0 mx-8 flex-row items-center justify-center rounded-lg bg-primary py-2"
            onPress={handleAcceptPath}
            disabled={mutationAcceptPath.isPending}>
            {mutationAcceptPath.isPending ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                <Text className="text-lg font-semibold text-white">{t('acceptingPath')}</Text>
              </View>
            ) : (
              <Text className="text-lg font-semibold text-white">{t('acceptPath')}</Text>
            )}
          </Pressable>
        )}

      {selectedUserPath && <NavigationBottomSheet path={selectedUserPath} />}
    </>
  );
};
