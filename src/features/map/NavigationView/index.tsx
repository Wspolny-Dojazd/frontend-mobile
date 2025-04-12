import { useDebouncedState } from '@mantine/hooks';
import Monicon from '@monicon/native';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, FlatList, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Details, Marker, Polyline, Region } from 'react-native-maps';

import { MapPath } from './MapPath';
import { NavigationBottomSheet } from './NavigationBottomSheet';
import { MOCK_PATHS } from './mocks';

import { components } from '@/src/api/openapi';
import { CustomMapView } from '@/src/features/map/CustomMapView';
import { LocationButton } from '@/src/features/map/LocationButton';
import { useLocation } from '@/src/features/map/useLocation';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';
import { cn } from '@/src/lib/utils';

const NAMESPACE = 'src/features/map/SearchLocationView';
const TRANSLATIONS = {
  en: {
    whereAreYouGoing: 'Search the place you want to go...',
    selectedPlace: 'Selected Place',
    newRide: 'New Ride',
    meters: 'm',
    kilometers: 'km',
    pressAndHoldToDropPin: 'Or press and hold on the map to drop a pin',
  },
  pl: {
    whereAreYouGoing: 'Wyszukaj miejsce, do którego chcesz się dostać...',
    selectedPlace: 'Wybrane miejsce',
    newRide: 'Nowy Przejazd',
    meters: 'm',
    kilometers: 'km',
    pressAndHoldToDropPin: 'Lub naciśnij i przytrzymaj na mapie, aby upuścić pinezkę',
  },
};

type UserLocationMarkerProps = {
  latitude: number;
  longitude: number;
  userName: string;
};

const UserLocationMarker = ({ latitude, longitude, userName }: UserLocationMarkerProps) => {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      style={{ overflow: 'visible', zIndex: 20 }}>
      <View className="h-10 w-10 flex-row items-center justify-center rounded-full border border-gray-700 bg-gray-800">
        <Text className="font-bold text-white">{userName.slice(0, 2)}</Text>
      </View>
    </Marker>
  );
};

export const NavigationView = () => {
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
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

  const [currentLatitudeDelta, setCurrentLatitudeDelta] = useDebouncedState(0.0922, 100); // Initial delta

  const handleRegionChangeComplete = useCallback((region: Region, details: Details) => {
    setCurrentLatitudeDelta(region.latitudeDelta);
    // console.log('Current Latitude Delta:', region.latitudeDelta); // For debugging
  }, []);

  const [selectedUser, setSelectedUser] = useState<string>(MOCK_PATHS[0]?.paths[0]?.userId ?? '');

  const selectedUserPath = MOCK_PATHS[0]?.paths.find((path) => path.userId === selectedUser);

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
        {MOCK_PATHS[0]?.paths.map((path) => {
          const muted = path.userId !== selectedUser;
          return <MapPath path={path} currentLatitudeDelta={currentLatitudeDelta} muted={muted} />;
        })}

        <UserLocationMarker latitude={52.237049} longitude={21.017532} userName="ke" />
      </CustomMapView>

      {/* <View className="elevation absolute left-0 right-0 top-0 mx-8 mt-10 h-14 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-primary px-3">
        <Monicon name="bx:walk" size={24} color="white" />
        <Text className="text-lg font-bold text-white">
          Kieruj się na przystanek: SGGW Rektorat
        </Text>
      </View> */}

      <FlatList
        horizontal
        data={MOCK_PATHS[0]?.paths}
        keyExtractor={(item) => item.userId}
        ItemSeparatorComponent={() => <View className="w-2" />}
        renderItem={({ item: path }) => {
          const muted = path.userId !== selectedUser;
          return (
            <Pressable
              key={path.userId}
              className={cn(
                'flex-row items-center justify-center rounded-lg px-3 py-2',
                muted ? 'bg-subtle' : 'bg-primary'
              )}
              onPress={() => setSelectedUser(path.userId)}>
              <Text className="text-lg font-bold text-white">USER {path.userId.slice(0, 6)}</Text>
            </Pressable>
          );
        }}
        className="elevation absolute left-0 right-0 top-0 mx-8 mt-12"
      />

      <LocationButton
        isLocating={isLocating}
        isMapCentered={isMapCentered}
        errorMsg={errorMsg}
        colorScheme={colorScheme}
        onPress={handleCenterOnUser}
        className="absolute bottom-36 right-5"
      />

      <NavigationBottomSheet path={selectedUserPath!} />
    </>
  );
};
