import { Stack } from 'expo-router';
import { createContext, useContext, useState } from 'react';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

interface CoordinateContextType {
  destinationCoordinate: Coordinate | null;
  setDestinationCoordinate: (coordinate: Coordinate | null) => void;
}

export const CoordinateContext = createContext<CoordinateContextType>({
  destinationCoordinate: null,
  setDestinationCoordinate: () => {},
});

export const useCoordinateContext = () => useContext(CoordinateContext);

export default function TransitLayout() {
  const [destinationCoordinate, setDestinationCoordinate] = useState<Coordinate | null>(null);

  return (
    <CoordinateContext.Provider value={{ destinationCoordinate, setDestinationCoordinate }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="chooseDestination"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </CoordinateContext.Provider>
  );
}
