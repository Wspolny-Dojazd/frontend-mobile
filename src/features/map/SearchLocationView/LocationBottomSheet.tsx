import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Clipboard from 'expo-clipboard';
import { useRef, useCallback, useState, useMemo } from 'react';
import { Text, View, Pressable } from 'react-native';

import { calculateDistance } from '@/src/lib/calculateDistance';
import { MapPin } from '@/src/lib/icons/MapPin';
import { X } from '@/src/lib/icons/X';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';
import { useTheme } from '@/src/lib/useTheme';
import { useDistanceConverter } from '@/src/hooks/useDistanceConverter';

const NAMESPACE = 'src/features/map/SearchLocationView';
const TRANSLATIONS = {
  en: {
    selectedPlace: 'Selected Place',
    newRide: 'New Ride',
    meters: 'm',
  },
  pl: {
    selectedPlace: 'Wybrane miejsce',
    newRide: 'Nowy Przejazd',
    meters: 'm',
  },
};

export type Place = {
  id: number;
  name: string;
  distance: number;
  address: string;
  postcode: string;
  latitude: number;
  longitude: number;
};

export type Coordinate = {
  latitude: number;
  longitude: number;
};

type LocationBottomSheetProps = {
  selectedCoordinate: Coordinate | null;
  selectedPlace: Place | null;
  location: {
    coords: {
      latitude: number;
      longitude: number;
    };
  } | null;
  onClose: () => void;
  index: number;
  onAccept?: () => void;
  acceptButtonText?: string;
};

export const LocationBottomSheet = ({
  selectedCoordinate,
  selectedPlace,
  location,
  onClose,
  index,
  onAccept,
  acceptButtonText,
}: LocationBottomSheetProps) => {
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [contentHeight, setContentHeight] = useState(1);

const snapPoints = useMemo(() => {
  return [contentHeight > 1 ? contentHeight : 10]; // fallback
}, [contentHeight]);
  const theme = useTheme();
  const { convertDistance } = useDistanceConverter();

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    onClose();
  }, [onClose]);
  if (!selectedPlace && !selectedCoordinate) return null;

 return (
  <BottomSheet
    ref={bottomSheetRef}
    snapPoints={snapPoints}
    index={index}
    handleComponent={null}
    backgroundStyle={{ backgroundColor: theme.background }}
    style={{
      borderWidth: 1,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderColor: theme.border,
    }}>
    <BottomSheetView>
      <View
        className="relative flex w-full flex-col items-center justify-start gap-4 px-4 pt-4"
        onLayout={(event) => setContentHeight(event.nativeEvent.layout.height + 20)}>
        {/* górny kontener */}
        <View className="relative flex w-full flex-col items-center justify-start gap-4 px-4 pt-4">
          <Pressable className="absolute right-0 top-0 p-6" onPress={handleClose}>
            <X size={20} color="gray" />
          </Pressable>

          {/* wiersz z pinezką i opisem */}
          <View className="flex w-full flex-row items-center justify-start">
            <MapPin size={32} className="text-primary" />

            <View className="ml-4 flex w-[80%] flex-col items-start justify-start">
              <View className="flex flex-row items-baseline">
                <Text className="text-wrap pt-1 text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedPlace ? selectedPlace.name : t('selectedPlace')}
                </Text>

                {location && (selectedCoordinate || selectedPlace) && (
                  <Text className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {(() => {
                      const lat = selectedCoordinate?.latitude ?? selectedPlace?.latitude;
                      const lng = selectedCoordinate?.longitude ?? selectedPlace?.longitude;

                      if (lat !== undefined && lng !== undefined) {
                        const rawDistance = calculateDistance(
                          location.coords.latitude,
                          location.coords.longitude,
                          lat,
                          lng
                        );
                        return ` ${convertDistance(rawDistance)}`;
                      }
                      return '';
                    })()}
                  </Text>
                )}
              </View>

              {/* adres lub koordynaty */}
              {selectedPlace && (
                <Pressable
                  onLongPress={() =>
                    Clipboard.setStringAsync(
                      `${selectedPlace.latitude}, ${selectedPlace.longitude}`
                    )
                  }>
                  <Text className="mt-1 text-base text-gray-600 dark:text-gray-300">
                    {selectedPlace.address}
                  </Text>
                </Pressable>
              )}

              {selectedCoordinate && !selectedPlace && (
                <Pressable
                  onLongPress={() =>
                    Clipboard.setStringAsync(
                      `${selectedCoordinate.latitude}, ${selectedCoordinate.longitude}`
                    )
                  }>
                  <Text className="mt-1 text-base text-gray-600 dark:text-gray-300">
                    {selectedCoordinate.latitude}, {selectedCoordinate.longitude}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* przycisk akceptacji */}
          <Pressable className="mt-4 w-full rounded-3xl bg-primary px-6 py-4" onPress={onAccept}>
            <Text className="text-center text-xl font-semibold text-white">
              {acceptButtonText ?? t('newRide')}
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheetView>
  </BottomSheet>
);
