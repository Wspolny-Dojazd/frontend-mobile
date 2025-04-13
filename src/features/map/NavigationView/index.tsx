import { useDebouncedState } from '@mantine/hooks';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import MapView, { Details, Marker, Region } from 'react-native-maps';

import { MapPath } from './MapPath';
import { NavigationBottomSheet } from './NavigationBottomSheet';
import { MOCK_PATHS } from './mocks';
import { CustomMapView } from '@/src/features/map/CustomMapView';
import { LocationButton } from '@/src/features/map/LocationButton';
import { useLocation } from '@/src/features/map/useLocation';
import { cn } from '@/src/lib/utils';

type PathData = (typeof MOCK_PATHS)[0]['paths'][number];

export const NavigationView = () => {
  const { colorScheme } = useColorScheme();
  const mapRef = useRef<MapView>(null);

  const { errorMsg, isLocating, isMapCentered, handleMapChange, handleCenterOnUser } = useLocation({
    mapRef,
  });

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

  const availablePaths = useMemo(() => MOCK_PATHS[0]?.paths ?? [], []);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    availablePaths[0]?.userId ?? null
  );

  const selectedUserPath = useMemo(() => {
    if (!selectedUserId) return null;
    return availablePaths.find((path) => path.userId === selectedUserId) ?? null;
  }, [availablePaths, selectedUserId]);

  const userPathsComponents = useMemo(() => {
    return availablePaths.map((path) => (
      <MapPath
        key={`map-path-${path.userId}`}
        path={path}
        currentLatitudeDelta={Number(currentLatitudeDelta.toFixed(3))}
        muted={path.userId !== selectedUserId}
      />
    ));
  }, [availablePaths, currentLatitudeDelta, selectedUserId]);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);

  const renderUserPathSelectorItem = useCallback(
    ({ item }: { item: PathData }) => {
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

  const keyExtractor = useCallback((item: PathData) => item.userId, []);

  const ItemSeparator = useCallback(() => <View className="w-3" />, []);

  return (
    <>
      <CustomMapView
        ref={mapRef}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={handleMapChange}
        showsCompass={false}
        onRegionChange={handleRegionChangeComplete}>
        {userPathsComponents}
        <UserLocationMarker latitude={52.237049} longitude={21.017532} userName="KE" />
      </CustomMapView>

      {availablePaths.length > 0 && (
        <FlatList<PathData>
          horizontal
          data={availablePaths}
          keyExtractor={keyExtractor}
          renderItem={renderUserPathSelectorItem}
          ItemSeparatorComponent={ItemSeparator}
          className="absolute left-0 right-0 top-0 mx-8 mt-12 shadow-lg"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 2 }}
          initialNumToRender={7}
          maxToRenderPerBatch={5}
          windowSize={11}
        />
      )}

      <LocationButton
        isLocating={isLocating}
        isMapCentered={isMapCentered}
        errorMsg={errorMsg}
        colorScheme={colorScheme}
        onPress={handleCenterOnUser}
        className="absolute bottom-36 right-5 z-10"
      />

      {selectedUserPath && <NavigationBottomSheet path={selectedUserPath} />}
    </>
  );
};

type UserLocationMarkerProps = {
  latitude: number;
  longitude: number;
  userName: string;
};

const UserLocationMarker = React.memo(
  ({ latitude, longitude, userName }: UserLocationMarkerProps) => {
    const initials = userName.slice(0, 2);

    return (
      <Marker
        key={`user-location-marker-${userName}`}
        coordinate={{ latitude, longitude }}
        anchor={{ x: 0.5, y: 0.5 }}
        style={{ overflow: 'visible', zIndex: 20 }}>
        <View className="h-10 w-10 flex-row items-center justify-center rounded-full border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
          <Text className="font-bold text-foreground">{initials}</Text>
        </View>
      </Marker>
    );
  }
);
UserLocationMarker.displayName = 'UserLocationMarker';

type UserPathSelectorItemProps = {
  path: PathData;
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
            User {path.userId.slice(0, 6)}
          </Text>
        </View>
      </Pressable>
    );
  }
);
UserPathSelectorItem.displayName = 'UserPathSelectorItem';
