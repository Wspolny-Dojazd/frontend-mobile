import * as Location from 'expo-location';
import { useState, useEffect, useCallback, useRef } from 'react'; // Dodano useRef, jeśli jest używany w hooku
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
    console.log('useLocation: Rozpoczynanie żądania uprawnień lokalizacji...');
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log('useLocation: Status uprawnień lokalizacji:', status);

    if (status !== 'granted') {
      setErrorMsg('Dostęp do lokalizacji został odrzucony.');
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
        console.log('useLocation: Próba pobrania aktualnej pozycji...');
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        console.log('useLocation: Otrzymano surową lokalizację:', currentLocation);
        if (currentLocation && currentLocation.coords) {
          console.log(
            'useLocation: Uzyskano prawidłową lokalizację:',
            currentLocation.coords.latitude,
            currentLocation.coords.longitude
          );
          setLocation(currentLocation);
          return currentLocation;
        } else {
          console.log('useLocation: Otrzymano nieprawidłowe dane lokalizacji (brak coords).');
          // Ponów próbę z opóźnieniem, jeśli to właściwe
          if (retries > 0) {
            console.log(`useLocation: Ponawianie próby (${retries} pozostało)...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return getUserLocation(retries - 1);
          }
          return null;
        }
      } catch (error) {
        console.error('useLocation: Błąd podczas pobierania lokalizacji w getUserLocation:', error);
        // Ponów próbę z opóźnieniem, jeśli to właściwe
        if (retries > 0) {
          console.log(`useLocation: Ponawianie próby po błędzie (${retries} pozostało)...`);
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
        // const permissionGranted = await requestLocationPermission(); // Już obsłużone w getUserLocation
        // if (!permissionGranted) {
        //   console.log('useLocation: Uprawnienia nie zostały udzielone do centrowania.');
        //   return false;
        // }

        console.log(
          'useLocation: Czy mapRef.current jest dostępny do centrowania:',
          !!mapRef.current
        );
        // Pobierz nową lokalizację i użyj zwróconej wartości natychmiast
        const newLocation = await getUserLocation();
        console.log('useLocation: Lokalizacja uzyskana do centrowania:', newLocation);

        // Jeśli lokalizacja i referencja do mapy są dostępne, wyśrodkuj mapę
        if (newLocation && mapRef.current && newLocation.coords) {
          console.log(
            'useLocation: Próba animacji mapy do regionu:',
            newLocation.coords.latitude,
            newLocation.coords.longitude
          );
          mapRef.current.animateToRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.01, // Standardowe wartości dla bliższego zoomu
            longitudeDelta: 0.01,
          });
          return true;
        } else {
          console.log(
            'useLocation: Nie można wyśrodkować mapy: brak danych lokalizacji lub refa mapy.'
          );
        }
        return false;
      } catch (error) {
        console.error('useLocation: Błąd podczas centrowania na lokalizacji użytkownika:', error);
        return false;
      }
    },
    [getUserLocation] // Zależy od getUserLocation
  );

  const handleMapChange = useCallback(() => {
    if (isMapCentered) {
      setIsMapCentered(false);
      console.log(
        'useLocation: Mapa przesunięta przez użytkownika, isMapCentered ustawione na false.'
      );
    }
  }, [isMapCentered]);

  // Główna funkcja wywoływana przez przycisk centrowania
  const handleCenterOnUser = useCallback(async () => {
    setIsLocating(true); // Rozpocznij stan ładowania
    console.log('useLocation: Wywołano handleCenterOnUser.');
    try {
      const success = await centerOnUserLocation(mapRef);
      if (success) {
        setIsMapCentered(true); // Ustaw na true, jeśli centrowanie się powiodło
        console.log('useLocation: Mapa pomyślnie wyśrodkowana.');
      } else {
        console.log('useLocation: Wyśrodkowanie mapy nie powiodło się.');
      }
    } catch (error) {
      console.error('useLocation: Błąd przechwycony w handleCenterOnUser:', error);
      // Nie rzucaj ponownie błędu, aby zapobiec awariom aplikacji
    } finally {
      setIsLocating(false); // Zakończ stan ładowania
      console.log('useLocation: isLocating ustawione na false.');
    }
  }, [centerOnUserLocation, mapRef]); // Zależy od centerOnUserLocation i mapRef

  // Efekt uruchamiany raz przy montowaniu komponentu w celu pobrania początkowej lokalizacji
  // i/lub spróbowania wyśrodkowania mapy na starcie.
  useEffect(() => {
    (async () => {
      console.log('useLocation: Efekt useEffect uruchomiony.');
      setIsLocating(true); // Rozpocznij stan ładowania dla początkowego centrowania
      try {
        // Spróbuj uzyskać lokalizację i wyśrodkować mapę przy starcie.
        // getUserLocation już obsługuje prośbę o uprawnienia.
        const initialLocation = await getUserLocation();
        if (initialLocation && mapRef.current) {
          console.log(
            'useLocation: Próba początkowego wyśrodkowania mapy po uzyskaniu lokalizacji.'
          );
          mapRef.current.animateToRegion({
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setIsMapCentered(true);
        } else {
          console.log(
            'useLocation: Nie udało się wyśrodkować mapy na starcie (brak lokalizacji lub refa mapy).'
          );
        }
      } catch (error) {
        console.error('useLocation: Błąd podczas początkowego uruchomienia useEffect:', error);
      } finally {
        setIsLocating(false); // Zakończ stan ładowania
      }
    })();
  }, [mapRef, getUserLocation]); // Zależy od mapRef i getUserLocation

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
