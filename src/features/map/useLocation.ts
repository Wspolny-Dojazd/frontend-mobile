import * as Location from 'expo-location';
import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Function to request location permissions
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setErrorMsg('Dostęp do lokalizacji został odrzucony.');
      return false;
    }
    setErrorMsg(null);
    return true;
  }, []);

  // Function to get user's current location, now also responsible for permissions
  const getUserLocation = useCallback(
    async (retries = 3): Promise<Location.LocationObject | null> => {
      // First, ensure permissions are granted
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) {
        return null;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (currentLocation && currentLocation.coords) {
          setLocation(currentLocation);
          return currentLocation;
        } else {
          // Retry with a delay if location data is invalid
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return getUserLocation(retries - 1);
          }
          return null;
        }
      } catch (error) {
        // Retry with a delay on error
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return getUserLocation(retries - 1);
        }

        setErrorMsg('Nie udało się pobrać Twojej lokalizacji.'); // Set error only after retries are exhausted

        return null;
      }
    },
    [requestLocationPermission]
  );

  // Function to center the map on the user's location
  const centerOnUserLocation = useCallback(
    async (mapRef: React.RefObject<MapView>): Promise<boolean> => {
      try {
        // Get the latest location (getUserLocation handles permissions)
        const newLocation = await getUserLocation();

        // If location and map reference are available, animate the map
        if (newLocation && mapRef.current && newLocation.coords) {
          mapRef.current.animateToRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.01, // Standard values for closer zoom
            longitudeDelta: 0.01,
          });
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    },
    [getUserLocation]
  );

  const handleMapChange = useCallback(() => {
    if (isMapCentered) {
      setIsMapCentered(false);
    }
  }, [isMapCentered]);

  // Main function called by the centering button
  const handleCenterOnUser = useCallback(async () => {
    setIsLocating(true); // Start loading state
    try {
      const success = await centerOnUserLocation(mapRef);
      if (success) {
        setIsMapCentered(true); // Set to true if centering was successful
      }
    } catch (error) {
      // Error handled by centerOnUserLocation, no need to rethrow
    } finally {
      setIsLocating(false); // End loading state
    }
  }, [centerOnUserLocation, mapRef]);

  // Effect run once on component mount to get initial location
  // and/or try to center the map on startup.
  useEffect(() => {
    (async () => {
      setIsLocating(true); // Start loading state for initial centering
      try {
        // Attempt to get location and center the map on startup.
        // getUserLocation already handles permission requests.
        const initialLocation = await getUserLocation();
        if (initialLocation && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setIsMapCentered(true);
        }
      } catch (error) {
        // Error handled by getUserLocation, no need to rethrow.
      } finally {
        setIsLocating(false); // End loading state
      }
    })();
  }, [mapRef, getUserLocation]);

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
