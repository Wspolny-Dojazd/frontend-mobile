import Monicon from '@monicon/native';
import { useColorScheme } from 'nativewind';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { Text, View, Pressable } from 'react-native';
import MapView, { Marker, LongPressEvent, Polyline } from 'react-native-maps';

import { Coordinate } from '../SearchLocationView';
import { NavigationBottomSheet } from './NavigationBottomSheet';

import { CustomMapView } from '@/src/features/map/CustomMapView';
import { LocationButton } from '@/src/features/map/LocationButton';
import {
  LocationBottomSheet,
  Place,
} from '@/src/features/map/SearchLocationView/LocationBottomSheet';
import { SearchView } from '@/src/features/map/SearchLocationView/SearchView';
import { useLocation } from '@/src/features/map/useLocation';
import { Search } from '@/src/lib/icons/Search';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';
import { useTheme } from '@/src/lib/useTheme';

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

export const NavigationView = () => {
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
  const { colorScheme } = useColorScheme();
  const mapRef = useRef<MapView>(null);
  const theme = useTheme();

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

  return (
    <>
      <CustomMapView
        ref={mapRef}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={handleMapChange}
        showsCompass={false}>
        <Marker
          coordinate={{ latitude: 52.237049, longitude: 21.017532 }}
          title="Marker 1"
          description="First marker"
          pinColor="blue"
        />
        <Marker
          coordinate={{ latitude: 52.2512, longitude: 21.0138 }}
          title="Marker 2"
          description="Second marker"
          pinColor="red"
        />
        <Polyline
          coordinates={[
            { latitude: 52.237049, longitude: 21.017532 },
            { latitude: 52.2512, longitude: 21.0138 },
          ]}
          strokeColor="green"
          strokeWidth={4}
        />
      </CustomMapView>

      <View className="elevation absolute left-0 right-0 top-0 mx-8 mt-10 h-14 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-primary px-3">
        <Monicon name="bx:walk" size={24} color="white" />
        <Text className="text-lg font-bold text-white">
          Kieruj się na przystanek: SGGW Rektorat
        </Text>
      </View>

      <LocationButton
        isLocating={isLocating}
        isMapCentered={isMapCentered}
        errorMsg={errorMsg}
        colorScheme={colorScheme}
        onPress={handleCenterOnUser}
        className="absolute bottom-36 right-5"
      />

      <NavigationBottomSheet />
    </>
  );
};
