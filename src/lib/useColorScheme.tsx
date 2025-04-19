import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLOR_SCHEME_KEY = 'user-color-scheme';

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  const isInitialMount = useRef(true);

  // Load saved color scheme on mount once
  useEffect(() => {
    const loadSavedColorScheme = async () => {
      try {
        const savedColorScheme = await AsyncStorage.getItem(COLOR_SCHEME_KEY);
        if (savedColorScheme && (savedColorScheme === 'dark' || savedColorScheme === 'light')) {
          setColorScheme(savedColorScheme);
        }
      } catch (error) {
        console.error('Failed to load color scheme:', error);
      }
    };

    if (isInitialMount.current) {
      loadSavedColorScheme();
      isInitialMount.current = false;
    }
  }, []); // Empty dependency array means this runs once on mount

  // Enhanced setColorScheme that persists to storage
  const setAndPersistColorScheme = useCallback(
    (scheme: 'dark' | 'light' | 'system') => {
      setColorScheme(scheme);
      AsyncStorage.setItem(COLOR_SCHEME_KEY, scheme).catch((error) => {
        console.error('Failed to save color scheme:', error);
      });
    },
    [] // Empty dependency array to prevent recreation
  );

  return {
    colorScheme: colorScheme ?? 'dark',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme: setAndPersistColorScheme,
    toggleColorScheme,
  };
}
