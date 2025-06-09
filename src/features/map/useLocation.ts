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

<<<<<<< Updated upstream
        // Sprawdź poprawność danych lokalizacji
=======
        console.log('useLocation: Otrzymano surową lokalizację:', currentLocation);

        // Walidacja danych lokalizacji przed ustawieniem
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        console.error('Error getting location:', error); // Zmień na error dla lepszej widoczności w konsoli

        // Logika ponawiania prób w przypadku błędu
=======
        console.error('useLocation: Błąd podczas pobierania lokalizacji w getUserLocation:', error);
        // Ponów próbę z opóźnieniem, jeśli to właściwe
>>>>>>> Stashed changes
        if (retries > 0) {
          console.log(`useLocation: Ponawianie próby po błędzie (${retries} pozostało)...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return getUserLocation(retries - 1); // Ponów próbę
        }
<<<<<<< Updated upstream

        setErrorMsg('Nie udało się pobrać Twojej lokalizacji.'); // Ustaw błąd tylko po wyczerpaniu ponownych prób
=======
>>>>>>> Stashed changes
        return null;
      }
    },
    [requestLocationPermission] // Zależy od requestLocationPermission
  );

  // Funkcja do centrowania mapy na lokalizacji użytkownika
  const centerOnUserLocation = useCallback(
    async (mapRef: React.RefObject<MapView>): Promise<boolean> => {
      try {
<<<<<<< Updated upstream
        // Pobierz aktualną lokalizację (getUserLocation teraz obsługuje uprawnienia)
=======
        // Jeśli nie mamy jeszcze uprawnień, poproś o nie
        if (errorMsg) {
          // Możesz też sprawdzić status bezpośrednio: const { status } = await Location.getForegroundPermissionsAsync(); if (status !== 'granted')
          const permissionGranted = await requestLocationPermission();
          if (!permissionGranted) {
            console.log('useLocation: Uprawnienia nie zostały udzielone do centrowania.');
            return false;
          }
        }

        console.log(
          'useLocation: Czy mapRef.current jest dostępny do centrowania:',
          !!mapRef.current
        );
        // Pobierz nową lokalizację i użyj zwróconej wartości natychmiast
>>>>>>> Stashed changes
        const newLocation = await getUserLocation();
        console.log('useLocation: Lokalizacja uzyskana do centrowania:', newLocation);

<<<<<<< Updated upstream
        // Jeśli lokalizacja i referencja do mapy są dostępne, wyśrodkuj mapę
=======
        // Użyj nowej lokalizacji bezpośrednio
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        console.error('Error centering on user location:', error);
        // Nie ustawiaj tutaj errorMsg, ponieważ getUserLocation już to zrobiło, jeśli to był błąd pobierania
=======
        console.error('useLocation: Błąd podczas centrowania na lokalizacji użytkownika:', error);
>>>>>>> Stashed changes
        return false;
      }
    },
    [getUserLocation] // Zależy od getUserLocation
  );

<<<<<<< Updated upstream
  // Resetuje status centrowania mapy, gdy użytkownik ręcznie przesunie mapę
=======
  // Zresetuj status centrowania, gdy mapa zostanie przesunięta przez użytkownika
>>>>>>> Stashed changes
  const handleMapChange = useCallback(() => {
    if (isMapCentered) {
      setIsMapCentered(false);
      console.log(
        'useLocation: Mapa przesunięta przez użytkownika, isMapCentered ustawione na false.'
      );
    }
  }, [isMapCentered]);

<<<<<<< Updated upstream
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
=======
  // Wyśrodkuj mapę na lokalizacji użytkownika i zaktualizuj status centrowania
  const handleCenterOnUser = useCallback(async () => {
    setIsLocating(true);
    console.log('useLocation: Wywołano handleCenterOnUser.');
    try {
      const success = await centerOnUserLocation(mapRef);
      if (success) {
        setIsMapCentered(true);
        console.log('useLocation: Mapa pomyślnie wyśrodkowana.');
      } else {
        console.log('useLocation: Wyśrodkowanie mapy nie powiodło się.');
      }
    } catch (error) {
      console.error('useLocation: Błąd przechwycony w handleCenterOnUser:', error);
      // Nie rzucaj ponownie błędu, aby zapobiec awariom aplikacji
    } finally {
      setIsLocating(false);
      console.log('useLocation: isLocating ustawione na false.');
>>>>>>> Stashed changes
    }
  }, [centerOnUserLocation, mapRef]); // Zależy od centerOnUserLocation i mapRef

  // Efekt uruchamiany raz przy montowaniu komponentu w celu początkowego centrowania mapy
  useEffect(() => {
    (async () => {
<<<<<<< Updated upstream
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
=======
      console.log('useLocation: Efekt useEffect uruchomiony.');
      const permissionGranted = await requestLocationPermission();
      if (permissionGranted) {
        getUserLocation(); // Pobierz początkową lokalizację po uzyskaniu uprawnień
      }
    })();
  }, []); // Pusta tablica zależności sprawia, że to uruchamia się tylko raz przy zamontowaniu
>>>>>>> Stashed changes

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
