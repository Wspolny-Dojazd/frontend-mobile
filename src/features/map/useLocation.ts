import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';

type UseLocationReturn = {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  requestLocationPermission: () => Promise<boolean>;
  getUserLocation: () => Promise<Location.LocationObject | null>;
  centerOnUserLocation: (mapRef: React.RefObject<MapView>) => Promise<boolean>;
};

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return false;
    }

    setErrorMsg(null);
    return true;
  };

  const getUserLocation = async (retries = 3): Promise<Location.LocationObject | null> => {
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
  };

  const centerOnUserLocation = async (mapRef: React.RefObject<MapView>): Promise<boolean> => {
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
  };

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
  };
};
