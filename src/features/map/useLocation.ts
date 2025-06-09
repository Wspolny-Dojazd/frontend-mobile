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

  // Funkcja do proszenia o uprawnienia do lokalizacji
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return false;
    }
    setErrorMsg(null); // Wyczyść błąd, jeśli uprawnienia zostały przyznane
    return true;
  }, []);

  // Funkcja do pobierania lokalizacji użytkownika, teraz odpowiedzialna również za uprawnienia
  const getUserLocation = useCallback(
    async (retries = 3): Promise<Location.LocationObject | null> => {
      // Najpierw upewnij się, że uprawnienia są przyznane
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) {
        // Błąd uprawnień jest już ustawiony w requestLocationPermission
        return null;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        // Sprawdź poprawność danych lokalizacji
        if (currentLocation && currentLocation.coords) {
          setLocation(currentLocation);
          return currentLocation;
        } else {
          console.log('Invalid location data received');
          return null;
        }
      } catch (error) {
        console.error('Error getting location:', error); // Zmień na error dla lepszej widoczności w konsoli

        // Logika ponawiania prób w przypadku błędu
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return getUserLocation(retries - 1); // Ponów próbę
        }

        setErrorMsg('Nie udało się pobrać Twojej lokalizacji.'); // Ustaw błąd tylko po wyczerpaniu ponownych prób
        return null;
      }
    },
    [requestLocationPermission] // Zależy od requestLocationPermission
  );

  // Funkcja do centrowania mapy na lokalizacji użytkownika
  const centerOnUserLocation = useCallback(
    async (mapRef: React.RefObject<MapView>): Promise<boolean> => {
      try {
        // Pobierz aktualną lokalizację (getUserLocation teraz obsługuje uprawnienia)
        const newLocation = await getUserLocation();

        // Jeśli lokalizacja i referencja do mapy są dostępne, wyśrodkuj mapę
        if (newLocation && mapRef.current && newLocation.coords) {
          mapRef.current.animateToRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.01, // Standardowe wartości dla bliższego zoomu
            longitudeDelta: 0.01,
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error centering on user location:', error);
        // Nie ustawiaj tutaj errorMsg, ponieważ getUserLocation już to zrobiło, jeśli to był błąd pobierania
        return false;
      }
    },
    [getUserLocation] // Zależy od getUserLocation
  );

  // Resetuje status centrowania mapy, gdy użytkownik ręcznie przesunie mapę
  const handleMapChange = useCallback(() => {
    if (isMapCentered) {
      setIsMapCentered(false);
    }
  }, [isMapCentered]);

  // Główna funkcja wywoływana przez przycisk centrowania
  const handleCenterOnUser = useCallback(async () => {
    setIsLocating(true); // Rozpocznij stan ładowania
    try {
      const success = await centerOnUserLocation(mapRef);
      if (success) {
        setIsMapCentered(true); // Ustaw na true, jeśli centrowanie się powiodło
      }
    } catch (error) {
      console.error('Error in handleCenterOnUser:', error);
    } finally {
      setIsLocating(false); // Zakończ stan ładowania
    }
  }, [centerOnUserLocation, mapRef]); // Zależy od centerOnUserLocation i mapRef

  // Efekt uruchamiany raz przy montowaniu komponentu w celu początkowego centrowania mapy
  useEffect(() => {
    (async () => {
      setIsLocating(true); // Rozpocznij stan ładowania dla początkowego centrowania
      try {
        // Użyj centerOnUserLocation, aby spróbować wyśrodkować mapę na starcie
        const success = await centerOnUserLocation(mapRef);
        if (success) {
          setIsMapCentered(true);
        }
      } catch (error) {
        console.error('Initial map centering error:', error);
      } finally {
        setIsLocating(false); // Zakończ stan ładowania
      }
    })();
  }, [mapRef, centerOnUserLocation]); // Zależy od mapRef i centerOnUserLocation

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
