import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import { Text, View, Pressable, TouchableOpacity, Image, StyleSheet } from 'react-native';
import MapView, { Marker, MapPressEvent, PoiClickEvent, LongPressEvent } from 'react-native-maps';

import UserLocationMarker from '../UserLocationMarker';

import { $api } from '@/src/api/api';
import { useAuth } from '@/src/context/authContext';
import { CustomMapView } from '@/src/features/map/CustomMapView';
import { LocationButton } from '@/src/features/map/LocationButton';
import {
  LocationBottomSheet,
  Place,
} from '@/src/features/map/SearchLocationView/LocationBottomSheet';
import { SearchView } from '@/src/features/map/SearchLocationView/SearchView';
import { useLocation } from '@/src/features/map/useLocation';
import { ChevronLeft } from '@/src/lib/icons/ChevronLeft';
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
    pressAndHoldToDropPin: 'Tap anywhere on the map to drop a pin',
  },
  pl: {
    whereAreYouGoing: 'Wyszukaj miejsce docelowe',
    selectedPlace: 'Wybrane miejsce',
    newRide: 'Nowy Przejazd',
    meters: 'm',
    kilometers: 'km',
    pressAndHoldToDropPin: 'Naciśnij w dowolnym miejscu na mapie, aby upuścić pinezkę',
  },
};

const MOCK_PLACES: Place[] = [
  {
    id: 1,
    name: 'Old Town',
    distance: 2.0,
    address: 'Rynek Starego Miasta',
    postcode: '00-272',
    latitude: 52.2497,
    longitude: 21.0081,
  },
  {
    id: 2,
    name: 'Royal Castle',
    distance: 2.0,
    address: 'Plac Zamkowy 4',
    postcode: '00-277',
    latitude: 52.2476,
    longitude: 21.0141,
  },
  {
    id: 3,
    name: 'Łazienki Park',
    distance: 2.0,
    address: 'Agrykoli 1',
    postcode: '00-460',
    latitude: 52.2167,
    longitude: 21.0369,
  },
  {
    id: 4,
    name: 'Wilanów Palace',
    distance: 2.0,
    address: 'Stanisława Kostki Potockiego 10/16',
    postcode: '02-958',
    latitude: 52.1653,
    longitude: 21.0903,
  },
  {
    id: 5,
    name: 'Palace of Culture and Science',
    distance: 2.0,
    address: 'Plac Defilad 1',
    postcode: '00-901',
    latitude: 52.2319,
    longitude: 21.0067,
  },
  {
    id: 6,
    name: 'National Museum in Warsaw',
    distance: 2.5,
    address: 'Al. Jerozolimskie 3',
    postcode: '00-495',
    latitude: 52.2286,
    longitude: 21.0156,
  },
  {
    id: 7,
    name: 'POLIN Museum of the History of Polish Jews And Holocaust',
    distance: 3.1,
    address: 'Anielewicza 6',
    postcode: '00-157',
    latitude: 52.2483,
    longitude: 20.9972,
  },
  {
    id: 8,
    name: 'Copernicus Science Centre',
    distance: 1.5,
    address: 'Wybrzeże Kościuszkowskie 20',
    postcode: '00-390',
    latitude: 52.2413,
    longitude: 21.0245,
  },
  {
    id: 9,
    name: 'PGE Narodowy',
    distance: 4.2,
    address: 'al. Księcia Józefa Poniatowskiego 1',
    postcode: '03-901',
    latitude: 52.2412,
    longitude: 21.0334,
  },
  {
    id: 10,
    name: 'Warsaw Uprising Museum',
    distance: 3.8,
    address: 'Grzybowska 79',
    postcode: '00-844',
    latitude: 52.2365,
    longitude: 20.9822,
  },
  {
    id: 11,
    name: 'Saxon Garden',
    distance: 2.8,
    address: 'Marszałkowska',
    postcode: '00-078',
    latitude: 52.241,
    longitude: 21.01,
  },
  {
    id: 12,
    name: "St. John's Archcathedral",
    distance: 2.3,
    address: 'Świętojańska 8',
    postcode: '00-278',
    latitude: 52.2512,
    longitude: 21.0138,
  },
  {
    id: 13,
    name: 'Presidential Palace',
    distance: 2.6,
    address: 'Krakowskie Przedmieście 46/48',
    postcode: '00-325',
    latitude: 52.242,
    longitude: 21.0144,
  },
  {
    id: 14,
    name: 'New Town Market Place',
    distance: 2.1,
    address: 'Rynek Nowego Miasta',
    postcode: '00-272',
    latitude: 52.2542,
    longitude: 21.0069,
  },
  {
    id: 15,
    name: 'Tomb of the Unknown Soldier',
    distance: 2.7,
    address: 'Plac marsz. Józefa Piłsudskiego',
    postcode: '00-078',
    latitude: 52.2414,
    longitude: 21.0075,
  },
];

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type SearchLocationViewProps = {
  selectedCoordinate: Coordinate | null;
  setSelectedCoordinate: (coordinate: Coordinate | null) => void;
  showBackButton?: boolean;
  onAccept?: () => void;
  acceptButtonText?: string;
  mapComponents?: React.ReactNode;
};

export const SearchLocationView = ({
  selectedCoordinate,
  setSelectedCoordinate,
  showBackButton = false,
  onAccept,
  acceptButtonText,
  mapComponents,
}: SearchLocationViewProps) => {
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
  const { colorScheme } = useColorScheme();
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  const { location, errorMsg, isLocating, isMapCentered, handleMapChange, handleCenterOnUser } =
    useLocation({
      mapRef,
    });

  const theme = useTheme();

  const initialRegion = useMemo(
    () => ({
      latitude: 52.237049,
      longitude: 21.017532,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    []
  );

  const [isSearchViewOpen, setIsSearchViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1);

  const handleMapPress = useCallback((event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    setSelectedCoordinate(coordinate);
    setBottomSheetIndex(0);
    setSelectedPlace(null);
  }, []);

  const handlePoiClick = useCallback((event: PoiClickEvent) => {
    const { coordinate } = event.nativeEvent;
    setSelectedCoordinate(coordinate);
    setBottomSheetIndex(0);
    setSelectedPlace(null);
  }, []);

  const handleLongPress = useCallback((event: LongPressEvent) => {
    const { coordinate } = event.nativeEvent;
    setSelectedCoordinate(coordinate);
    setBottomSheetIndex(0);
    setSelectedPlace(null);
  }, []);

  const handleClosePress = useCallback(() => {
    setBottomSheetIndex(-1);
    setSelectedCoordinate(null);
  }, []);

  const filteredPlaces = useMemo(() => {
    return MOCK_PLACES.filter((place) =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const centerMapOnCoordinate = useCallback((coordinate: Coordinate) => {
    mapRef.current?.animateToRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, []);

  useEffect(() => {
    if (selectedCoordinate) {
      centerMapOnCoordinate(selectedCoordinate);
    }
  }, [selectedCoordinate, centerMapOnCoordinate]);

  const handlePlaceSelect = useCallback((place: Place) => {
    setSelectedCoordinate({
      latitude: place.latitude,
      longitude: place.longitude,
    });
    setSelectedPlace(place);
    setBottomSheetIndex(0);
    setIsSearchViewOpen(false);
  }, []);

  if (isSearchViewOpen) {
    return (
      <SearchView
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredPlaces={filteredPlaces}
        onClose={() => setIsSearchViewOpen(false)}
        onPlaceSelect={handlePlaceSelect}
      />
    );
  }

  return (
    <>
      <View className="absolute left-0 right-0 top-0 z-10 mt-10 h-16 w-full flex-col items-center justify-start px-3">
        <Pressable
          className="w-full flex-row items-center gap-2 rounded-md bg-white px-3 py-3 dark:bg-gray-900 dark:text-white"
          onPress={() => {
            setIsSearchViewOpen(!isSearchViewOpen);
          }}>
          {showBackButton ? (
            <Pressable onPress={() => router.back()}>
              <ChevronLeft size={20} className="text-foreground" />
            </Pressable>
          ) : (
            <Search size={20} className="text-foreground" />
          )}

          <Text
            className={`${selectedPlace ? 'text-black dark:text-white' : 'text-muted-foreground'}`}>
            {selectedPlace
              ? selectedPlace.name.length > 40
                ? `${selectedPlace.name.substring(0, 40)}...`
                : selectedPlace.name
              : t('whereAreYouGoing')}
          </Text>
        </Pressable>

        <View className="mt-4 h-10 w-full flex-row items-center justify-center rounded-md bg-white/80 px-0 dark:bg-gray-700/50">
          <Text className="text-sm text-muted-foreground">{t('pressAndHoldToDropPin')}</Text>
        </View>
      </View>

      <CustomMapView
        ref={mapRef}
        initialRegion={initialRegion}
        showsMyLocationButton={false}
        onRegionChangeComplete={handleMapChange}
        onPress={handleMapPress}
        onLongPress={handleLongPress}
        onPoiClick={handlePoiClick}
        showsPointsOfInterest={false}
        showsCompass={false}
        scrollEnabled
        zoomEnabled
        rotateEnabled
        pitchEnabled
        pointerEvents="auto">
        {selectedCoordinate && (
          <Marker
            coordinate={selectedCoordinate}
            title="Selected Coordinate"
            description="Selected coordinate on the map"
            pinColor={theme.primary}
          />
        )}

        {mapComponents}
      </CustomMapView>

      <View style={styles.bottomRightActions}>
        <LocationButton
          isLocating={isLocating}
          isMapCentered={isMapCentered}
          errorMsg={errorMsg}
          colorScheme={colorScheme}
          onPress={handleCenterOnUser}
          style={styles.locationButton}
        />
        <TouchableOpacity style={styles.chatButton} onPress={() => console.log('Chat button pressed')}>
          <Image
            source={require('@/assets/icons/chat.png')}
            style={styles.chatIcon}
          />
        </TouchableOpacity>
      </View>

      <LocationBottomSheet
        selectedCoordinate={selectedCoordinate}
        selectedPlace={selectedPlace}
        location={location}
        onClose={handleClosePress}
        index={bottomSheetIndex}
        onAccept={onAccept}
        acceptButtonText={acceptButtonText}
      />
    </>
  );
};

const styles = StyleSheet.create({
  bottomRightActions: {
    position: 'absolute',
    bottom: 20 + 20 + 70,
    right: 20,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
    zIndex: 10,
  },
  locationButton: {
    backgroundColor: 'white',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatButton: {
    backgroundColor: 'white',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatIcon: {
    width: 24,
    height: 24,
    tintColor: 'gray',
  },
});
