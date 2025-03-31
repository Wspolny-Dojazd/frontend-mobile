import * as Location from 'expo-location';
import { useState, useEffect, useCallback } from 'react';
import MapView from 'react-native-maps';

type UseLocationReturn = {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  requestLocationPermission: () => Promise<boolean>;
  getUserLocation: () => Promise<Location.LocationObject | null>;
  centerOnUserLocation: (mapRef: React.RefObject<MapView>) => Promise<boolean>;
  isLocating: boolean;
  isMapCentered: boolean;
  handleMapChange: () => void;
  handleCenterOnUser: () => Promise<void>;
};

export type UseLocationProps = {
  mapRef: React.RefObject<MapView>;
};

export const useLocation = ({ mapRef }: UseLocationProps): UseLocationReturn => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapCentered, setIsMapCentered] = useState(false);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return false;
    }

    setErrorMsg(null);
    return true;
  }, []);

  const getUserLocation = useCallback(
    async (retries = 3): Promise<Location.LocationObject | null> => {
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
        return currentLocation;
      } catch (error) {
        console.log('Error getting location:', error);

        // Retry with a delay if appropriate
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return getUserLocation(retries - 1);
        }

        return null;
      }
    },
    [location]
  );

  const centerOnUserLocation = useCallback(
    async (mapRef: React.RefObject<MapView>): Promise<boolean> => {
      // If we don't have permission yet, request it
      if (errorMsg) {
        const permissionGranted = await requestLocationPermission();
        if (!permissionGranted) return false;
      }

      // If we already have location, use it
      if (location && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        return true;
      } else {
        // Get a new location and use the returned value immediately
        // instead of relying on the state update
        const newLocation = await getUserLocation();

        // Use the new location directly
        if (newLocation && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          return true;
        }
        return false;
      }
    },
    [errorMsg, location, mapRef]
  );

  // Reset centered status when map is moved by user
  const handleMapChange = useCallback(() => {
    if (isMapCentered) {
      setIsMapCentered(false);
    }
  }, [isMapCentered]);

  // Center map on user location and update centered status
  const handleCenterOnUser = useCallback(async () => {
    setIsLocating(true);
    try {
      const success = await centerOnUserLocation(mapRef);
      if (success) {
        setIsMapCentered(true);
      }
    } finally {
      setIsLocating(false);
    }
  }, [centerOnUserLocation, mapRef]);

  useEffect(() => {
    (async () => {
      const permissionGranted = await requestLocationPermission();
      if (permissionGranted) {
        getUserLocation();
      }
    })();
  }, []);

  return {
    location,
    errorMsg,
    requestLocationPermission,
    getUserLocation,
    centerOnUserLocation,
    isLocating,
    isMapCentered,
    handleMapChange,
    handleCenterOnUser,
  };
};
