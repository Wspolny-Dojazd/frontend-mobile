import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/src/components/ui/text';
import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { IconButton } from '@/src/components/ui/IconButton';
import * as Location from 'expo-location'; // Expo Location package for permissions
import { Feather } from '@expo/vector-icons'; // For search icon

type SelectedPlace = {
  name: string;
  description: string;
};

export default function App() {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinLocation, setPinLocation] = useState<LatLng | null>(null); // For storing the pin location
  const mapRef = useRef<MapView | null>(null);

  // Request location permissions on mount
  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === 'granted');

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    };

    requestLocationPermission();
  }, []);

  const handleMapPress = (event: { nativeEvent: { coordinate: LatLng } }) => {
    const { coordinate } = event.nativeEvent;

    setPinLocation(coordinate); // Set the pin location
    setSelectedPlace({
      name: 'Selected Location',
      description: `Latitude: ${coordinate.latitude}, Longitude: ${coordinate.longitude}`,
    });

    setShowBottomSheet(true); // Show the bottom sheet with place details
  };

  const handleRecenter = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={24} color="gray" style={styles.searchIcon} />
          <TextInput
            placeholder="Search places..."
            value={searchQuery}
            onChangeText={(e) => setSearchQuery(e)}
            style={styles.searchBar}
          />
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          onLongPress={handleMapPress}
          showsUserLocation={locationPermissionGranted}
          userLocationAnnotationTitle="You are here"
          region={{
            latitude: userLocation?.latitude || 37.78825,
            longitude: userLocation?.longitude || -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          ref={mapRef}>
          {/* Display user's location as a green dot */}
          {userLocation && (
            <Marker coordinate={userLocation}>
              <View style={styles.greenDot} />
            </Marker>
          )}

          {/* Display pin if user clicks on the map */}
          {pinLocation && <Marker coordinate={pinLocation} pinColor="green" />}
        </MapView>

        {/* IconButton for recentering map */}
        <IconButton
          icon="crosshair"
          className="absolute bottom-4 left-4 rounded-2xl bg-white p-2 shadow-lg"
          onPress={handleRecenter}
        />
      </View>

      {/* Bottom Sheet with selected place details */}
      {showBottomSheet && selectedPlace && (
        <BottomSheet visible={showBottomSheet} onClose={() => setShowBottomSheet(false)}>
          <Text style={styles.bottomSheetTitle}>{selectedPlace?.name}</Text>
          <Text style={styles.bottomSheetDescription}>{selectedPlace?.description}</Text>
        </BottomSheet>
      )}

      {/* Debug Links */}
      <Text>Ekran główny</Text>
      <Link href="/map-test">(DEBUG) Go to Map Test</Link>
      <Link href="/search-place">(DEBUG) Go to Search Place</Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 8,
  },
  searchBarContainer: {
    width: '100%',
    paddingTop: 20, // Add some space at the top for the SearchBar
    paddingBottom: 10, // Add space below the SearchBar
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'gray',
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    height: 40,
    flex: 1,
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  greenDot: {
    width: 12,
    height: 12,
    backgroundColor: 'green',
    borderRadius: 6, // Circular dot
  },
  pin: {
    width: 30,
    height: 40,
    backgroundColor: 'green', // Green pin
    borderRadius: 15,
    transform: [{ rotate: '45deg' }], // Making it a diamond shape
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black', // Change text color to black
    marginBottom: 10, // Space between title and description
  },
  bottomSheetDescription: {
    fontSize: 14,
    color: 'black', // Change text color to black
  },
  bottomSheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    position: 'absolute', // Ensures it's positioned at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Make sure it's on top of other components
  },
});
