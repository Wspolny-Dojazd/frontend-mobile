import { useColorScheme } from 'nativewind';
import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomMapView } from '@/src/features/map/CustomMapView';
import { LocationButton } from '@/src/features/map/LocationButton';
import { useLocation } from '@/src/features/map/useLocation';

export default function App() {
  const mapRef = useRef<MapView | null>(null);
  const { colorScheme } = useColorScheme();
  const { location, errorMsg, requestLocationPermission, centerOnUserLocation } = useLocation();
  const [isMapCentered, setIsMapCentered] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([
    // Sample coordinates to simulate a navigation path
    { latitude: 52.2297, longitude: 21.0122 }, // Start
    { latitude: 52.232, longitude: 21.018 },
    { latitude: 52.234, longitude: 21.025 },
    { latitude: 52.238, longitude: 21.027 },
    { latitude: 52.241, longitude: 21.022 },
    { latitude: 52.243, longitude: 21.016 }, // End
  ]);
  const [estimatedDistance, setEstimatedDistance] = useState('3.2 km');
  const [estimatedTime, setEstimatedTime] = useState('12 min');

  // Default coordinates (will be replaced when location is available)
  const initialRegion = {
    latitude: 52.2297,
    longitude: 21.0122,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Reset centered status when map is moved by user
  const handleMapChange = () => {
    if (isMapCentered) {
      setIsMapCentered(false);
    }
  };

  // Center map on user location and update centered status
  const handleCenterOnUser = async () => {
    setIsLocating(true);
    try {
      const success = await centerOnUserLocation(mapRef);
      if (success) {
        setIsMapCentered(true);
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Calculate rough distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Update route if user location is available
  useEffect(() => {
    if (location) {
      // Create a path from user's current location
      const userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Generate a simulated path from user's location
      const simulatedPath = [
        userLocation,
        {
          latitude: userLocation.latitude + 0.002,
          longitude: userLocation.longitude + 0.003,
        },
        {
          latitude: userLocation.latitude + 0.004,
          longitude: userLocation.longitude + 0.001,
        },
        {
          latitude: userLocation.latitude + 0.006,
          longitude: userLocation.longitude + 0.005,
        },
        {
          latitude: userLocation.latitude + 0.008,
          longitude: userLocation.longitude + 0.002,
        },
      ];

      setRouteCoordinates(simulatedPath);

      // Calculate rough distance
      const start = simulatedPath[0];
      const end = simulatedPath[simulatedPath.length - 1];
      const distance = calculateDistance(
        start?.latitude ?? 0,
        start?.longitude ?? 0,
        end?.latitude ?? 0,
        end?.longitude ?? 0
      );

      // Update estimated distance and time
      setEstimatedDistance(`${distance.toFixed(1)} km`);

      // Rough estimate of time based on average walking speed of 5 km/h
      const timeInMinutes = Math.round((distance / 5) * 60);
      setEstimatedTime(`${timeInMinutes} min`);
    }
  }, [location]);

  // Helper function to get start and end points
  const getStartPoint = () => routeCoordinates[0];
  const getEndPoint = () => routeCoordinates[routeCoordinates.length - 1];

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        {errorMsg && (
          <TouchableOpacity
            onPress={requestLocationPermission}
            className="items-center bg-red-100 p-2 dark:bg-red-900">
            <Text className="text-red-600 dark:text-red-200">
              {errorMsg} (Tap to enable location)
            </Text>
          </TouchableOpacity>
        )}

        {/* Navigation Info Panel */}
        <View className={`px-4 py-3 ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <Text
            className={`text-lg font-semibold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
            Navigation Active
          </Text>
          <View className="mt-1 flex-row justify-between">
            <View className="flex-row items-center">
              <Text
                className={`mr-1 ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Distance:
              </Text>
              <Text
                className={`font-medium ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
                {estimatedDistance}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text
                className={`mr-1 ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                ETA:
              </Text>
              <Text
                className={`font-medium ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
                {estimatedTime}
              </Text>
            </View>
          </View>
        </View>

        <CustomMapView
          ref={mapRef}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          onRegionChangeComplete={handleMapChange}>
          {/* Navigation path polyline */}
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colorScheme === 'dark' ? '#4DA6FF' : '#147EFB'}
            strokeWidth={6}
            lineDashPattern={[0]}
            lineCap="round"
            lineJoin="round"
          />

          {/* Start marker */}
          <Marker
            coordinate={getStartPoint() ?? { latitude: 0, longitude: 0 }}
            title="Start"
            description="Starting point"
            pinColor="green"
          />

          {/* Destination marker */}
          <Marker
            coordinate={getEndPoint() ?? { latitude: 0, longitude: 0 }}
            title="Destination"
            description="Your destination"
            pinColor="red"
          />
        </CustomMapView>

        {/* Use the extracted LocationButton component */}
        <LocationButton
          isLocating={isLocating}
          isMapCentered={isMapCentered}
          errorMsg={errorMsg}
          colorScheme={colorScheme}
          onPress={handleCenterOnUser}
        />
      </View>
    </SafeAreaView>
  );
}

// Removed styles as they were moved to the LocationButton component
