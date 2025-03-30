import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/src/components/ui/text';
import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { IconButton } from '@/src/components/ui/IconButton';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';

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
  const [pinLocation, setPinLocation] = useState<LatLng | null>(null);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [pastSearches, setPastSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const mapRef = useRef<MapView | null>(null);

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

  const mockSearch = (query: string) => {
    const allPlaces = ['Place 1', 'Place 2', 'Place 3', 'Place 4', 'Place 5'];
    return allPlaces.filter((place) => place.toLowerCase().includes(query.toLowerCase()));
  };

  useEffect(() => {
    if (searchQuery) {
      const results = mockSearch(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleMapPress = (event: { nativeEvent: { coordinate: LatLng } }) => {
    const { coordinate } = event.nativeEvent;

    setPinLocation(coordinate);
    setSelectedPlace({
      name: 'Selected Location',
      description: `Latitude: ${coordinate.latitude}, Longitude: ${coordinate.longitude}`,
    });

    setShowBottomSheet(true);
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

  const handlePastSearch = (search: string) => {
    setSearchQuery(search);
    setIsFocused(true);
  };

  const addSearchToHistory = (search: string) => {
    if (!pastSearches.includes(search)) {
      setPastSearches([search, ...pastSearches]);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery) {
      addSearchToHistory(searchQuery);
      setSearchResults(mockSearch(searchQuery));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBarWrapper}>
            <Feather
              name={isFocused ? 'arrow-left' : 'search'}
              size={24}
              color="gray"
              style={styles.searchIcon}
              onPress={() => {
                if (isFocused) {
                  setIsFocused(false);
                  setSearchQuery('');
                }
              }}
            />
            <TextInput
              placeholder="Search places..."
              value={searchQuery}
              onChangeText={(e) => setSearchQuery(e)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={styles.searchBar}
              onSubmitEditing={handleSearchSubmit}
            />
          </View>
        </View>

        <View style={styles.resultsContainer}>
          {isFocused && !searchQuery && pastSearches.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.pastSearchesTitle}>Past Searches</Text>
              <FlatList
                data={pastSearches}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => setSearchQuery(item)}>
                    <Text style={styles.searchResultText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {isFocused && searchQuery && searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.searchResultItem}>
                    <Text style={styles.searchResultText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </View>

      <View style={[styles.mapContainer, isFocused && styles.whiteBackground]}>
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
          {pinLocation && <Marker coordinate={pinLocation} pinColor="green" />}
        </MapView>

        <IconButton
          icon="crosshair"
          onPress={handleRecenter}
          style={{ position: 'absolute', bottom: 20, left: 20 }}
        />
      </View>

      {showBottomSheet && selectedPlace && (
        <BottomSheet visible={showBottomSheet} onClose={() => setShowBottomSheet(false)}>
          <Text style={styles.bottomSheetTitle}>{selectedPlace?.name}</Text>
          <Text style={styles.bottomSheetDescription}>{selectedPlace?.description}</Text>
        </BottomSheet>
      )}

      <Text>Ekran główny</Text>
      <Link href="/map-test">(DEBUG) Go to Map Test</Link>
      <Link href="/search-place">(DEBUG) Go to Search Place</Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  searchBarContainer: {
    width: '100%',
    paddingHorizontal: 15,
    paddingBottom: 10,
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
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  searchResultsContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingVertical: 5,
  },
  pastSearchesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
    marginBottom: 10,
    paddingLeft: 10,
  },
  searchResultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchResultText: {
    color: 'black',
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
  whiteBackground: {
    backgroundColor: 'white',
  },
  greenDot: {
    width: 12,
    height: 12,
    backgroundColor: 'green',
    borderRadius: 6,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  bottomSheetDescription: {
    fontSize: 14,
    color: 'black',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
