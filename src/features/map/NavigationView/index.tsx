import { useDebouncedState } from '@mantine/hooks';
import { Monicon } from '@monicon/native';
import { useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import MapView, { Details, Marker, Region } from 'react-native-maps';

import { MapPath } from './MapPath';
import { NavigationBottomSheet } from './NavigationBottomSheet';

import { $api } from '@/src/api/api';
import { components } from '@/src/api/openapi';
import { useAuth } from '@/src/context/authContext';
import { CustomMapView } from '@/src/features/map/CustomMapView';
import { LocationButton } from '@/src/features/map/LocationButton';
import { useLocation } from '@/src/features/map/useLocation';
import { useTheme } from '@/src/lib/useTheme';
import { cn } from '@/src/lib/utils';

type ProposedPathDto = components['schemas']['ProposedPathDto'];
type PathData = ProposedPathDto['paths'][number];

type NavigationViewProps = {
  groupId: number;
};

export const NavigationView = ({ groupId }: NavigationViewProps) => {
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
    {}
  );

  const queryAcceptedPath = $api.useQuery('get', '/api/groups/{groupId}/paths/accepted', {
    headers: { Authorization: `Bearer ${token}` },
    params: { path: { groupId } },
  });

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

  const queryMembers = $api.useQuery('get', '/api/groups/{id}/members', {
    headers: { Authorization: `Bearer ${token}` },
    params: { path: { id: groupId } },
  });

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

  const [currentLatitudeDelta, setCurrentLatitudeDelta] = useDebouncedState(
    initialRegion.latitudeDelta,
    100
  );

  const handleRegionChangeComplete = useCallback(
    (region: Region, _details: Details) => {
      setCurrentLatitudeDelta(region.latitudeDelta);
    },
    [setCurrentLatitudeDelta]
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
        currentLatitudeDelta={Number(currentLatitudeDelta.toFixed(3))}
        muted={path.userId !== selectedUserId}
      />
    ));
  }, [usersPaths, currentLatitudeDelta, selectedUserId]);

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

  const renderUserPathSelectorItem = useCallback(
    ({ item }: { item: PathData & { nickname?: string } }) => {
      return (
        <UserPathSelectorItem
          path={item}
          isSelected={item.userId === selectedUserId}
          onSelect={handleSelectUser}
        />
      );
    },
    [selectedUserId, handleSelectUser]
  );

  const renderPathOptionItem = useCallback(
    ({ item, index }: { item: ProposedPathDto; index: number }) => {
      return (
        <PathOptionSelectorItem
          pathOption={item}
          pathIndex={index}
          isSelected={item.id === selectedPathId}
          onSelect={handleSelectPathOption}
        />
      );
    },
    [selectedPathId, handleSelectPathOption]
  );

  const keyExtractor = useCallback((item: PathData) => item.userId, []);
  const pathOptionKeyExtractor = useCallback((item: ProposedPathDto) => item.id, []);

  const ItemSeparator = useCallback(() => <View className="w-3" />, []);

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
        {queryMembers.data?.map(
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
        )}
      </CustomMapView>

      {/* TODO: This should be like on mockups */}
      <View className="absolute left-0 right-0 top-0 mx-8 mt-12 shadow-lg">
        {!isPathAccepted && proposedPaths.length > 0 && (
          <FlatList<ProposedPathDto>
            horizontal
            data={proposedPaths}
            keyExtractor={pathOptionKeyExtractor}
            renderItem={renderPathOptionItem}
            ItemSeparatorComponent={ItemSeparator}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 2,
              flexGrow: 1,
              justifyContent: 'center',
            }}
            initialNumToRender={5}
            maxToRenderPerBatch={3}
            windowSize={9}
          />
        )}

        {usersPaths && usersPaths.length > 0 && (
          <FlatList<PathData & { nickname?: string }>
            horizontal
            data={usersPaths.map((path) => ({
              ...path,
              nickname: queryMembers.data?.find((member) => member.id === path.userId)?.nickname,
            }))}
            keyExtractor={keyExtractor}
            renderItem={renderUserPathSelectorItem}
            ItemSeparatorComponent={ItemSeparator}
            className="mt-4"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 2,
              flexGrow: 1,
              justifyContent: 'center',
            }}
            initialNumToRender={7}
            maxToRenderPerBatch={5}
            windowSize={11}
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

      {selectedUserPath && <NavigationBottomSheet path={selectedUserPath} />}

      {!queryAcceptedPath.isLoading && !isPathAccepted && (
        <Pressable
          className="absolute bottom-28 left-0 right-0 mx-8 flex-row items-center justify-center rounded-lg bg-primary py-2"
          onPress={handleAcceptPath}
          disabled={mutationAcceptPath.isPending}>
          {mutationAcceptPath.isPending ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
              {/* TODO: Translation */}
              <Text className="text-lg font-semibold text-white">Accepting path...</Text>
            </View>
          ) : (
            // TODO: Translation
            <Text className="text-lg font-semibold text-white">Accept path</Text>
          )}
        </Pressable>
      )}
    </>
  );
};

type UserLocationMarkerProps = {
  latitude: number;
  longitude: number;
  userName: string;
  isSelected?: boolean;
};

const UserLocationMarker = React.memo(
  ({ latitude, longitude, userName, isSelected = false }: UserLocationMarkerProps) => {
    const initials = userName.slice(0, 2);

    return (
      <Marker
        key={`user-location-marker-${userName}`}
        coordinate={{ latitude, longitude }}
        anchor={{ x: 0.5, y: 0.5 }}
        style={{ overflow: 'visible', zIndex: 200 }}>
        <View
          className={cn(
            'h-10 w-10 flex-row items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-700',
            isSelected ? 'border-white bg-primary dark:text-white' : ' bg-white dark:bg-gray-800'
          )}>
          <Text
            className={cn(
              'font-bold',
              isSelected ? 'text-primary-foreground' : 'text-foreground dark:text-gray-300'
            )}>
            {initials}
          </Text>
        </View>
      </Marker>
    );
  }
);
UserLocationMarker.displayName = 'UserLocationMarker';

type PathOptionSelectorItemProps = {
  pathOption: ProposedPathDto;
  pathIndex: number;
  isSelected: boolean;
  onSelect: (pathId: string) => void;
};

const PathOptionSelectorItem = React.memo(
  ({ pathOption, pathIndex, isSelected, onSelect }: PathOptionSelectorItemProps) => {
    const theme = useTheme();
    const handlePress = useCallback(() => {
      onSelect(pathOption.id);
    }, [onSelect, pathOption.id]);

    return (
      <Pressable
        className={cn(
          'flex-row items-center justify-center rounded-xl px-4 py-2.5 shadow-sm',
          isSelected ? 'bg-primary shadow-md' : 'bg-gray-100 dark:bg-gray-800'
        )}
        onPress={handlePress}>
        <View className="flex-row items-center gap-2">
          <Monicon
            name="tabler:route-alt-left"
            size={16}
            color={isSelected ? 'white' : theme.border}
          />
          <Text
            className={cn(
              'text-base font-semibold',
              isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'
            )}>
            Path {pathIndex + 1}
          </Text>
        </View>
      </Pressable>
    );
  }
);
PathOptionSelectorItem.displayName = 'PathOptionSelectorItem';

type UserPathSelectorItemProps = {
  path: PathData & { nickname?: string };
  isSelected: boolean;
  onSelect: (userId: string) => void;
};

const UserPathSelectorItem = React.memo(
  ({ path, isSelected, onSelect }: UserPathSelectorItemProps) => {
    const handlePress = useCallback(() => {
      onSelect(path.userId);
    }, [onSelect, path.userId]);

    const muted = !isSelected;

    return (
      <Pressable
        className={cn(
          'flex-row items-center justify-center rounded-xl px-4 py-2.5 shadow-sm',
          muted ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary shadow-md'
        )}
        onPress={handlePress}>
        <View className="flex-row items-center gap-2">
          <View
            className={cn(
              'h-2 w-2 rounded-full',
              muted ? 'bg-gray-400 dark:bg-gray-600' : 'bg-white'
            )}
          />
          <Text
            className={cn(
              'text-base font-semibold',
              muted ? 'text-gray-600 dark:text-gray-300' : 'text-white'
            )}>
            {path.nickname ?? path.userId.slice(0, 6)}
          </Text>
        </View>
      </Pressable>
    );
  }
);
UserPathSelectorItem.displayName = 'UserPathSelectorItem';
