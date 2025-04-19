import * as Location from 'expo-location';
import { LocationObject, LocationSubscription } from 'expo-location';
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to track the user's live location.
 * It requests location permissions and updates the location state
 * approximately every 5 seconds.
 *
 * @returns {{
 * location: LocationObject | null; // The current location object, or null if not available/permitted
 * errorMsg: string | null; // Error message if permission denied or other issues occur
 * permissionStatus: Location.PermissionStatus | null; // The current permission status
 * requestPermission: () => Promise<void>; // Function to manually request permission again
 * }}
 */
const useLiveLocation = () => {
  // State to hold the current location object
  const [location, setLocation] = useState<LocationObject | null>(null);
  // State to hold any error messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // State to hold the permission status
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  // Ref to store the location subscription
  const locationSubscription = useRef<LocationSubscription | null>(null);

  /**
   * Function to request foreground location permissions.
   */
  const requestPermission = async () => {
    try {
      // Request permission to access location while the app is in the foreground
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status); // Update permission status state

      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        // Clear any existing location data if permission is denied
        setLocation(null);
        // Stop watching if already watching
        locationSubscription.current?.remove();
        locationSubscription.current = null;
        return; // Exit if permission not granted
      }
      // Clear previous error message if permission granted
      setErrorMsg(null);
      // Start watching location if permission is granted
      startWatchingLocation();
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setErrorMsg('Failed to request location permission');
      setPermissionStatus(Location.PermissionStatus.UNDETERMINED); // Reset status on error
    }
  };

  /**
   * Function to start watching the user's location.
   */
  const startWatchingLocation = async () => {
    // Ensure we have granted status before watching
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    // Stop any previous subscription before starting a new one
    locationSubscription.current?.remove();

    try {
      // Start watching position updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, // Desired accuracy
          timeInterval: 5000, // Update interval in milliseconds (5 seconds)
          distanceInterval: 10, // Update distance in meters (optional)
        },
        (newLocation) => {
          // Callback function executed when location updates
          setLocation(newLocation); // Update location state
          setErrorMsg(null); // Clear error message on successful update
        }
      );
    } catch (error) {
      console.error('Error watching location:', error);
      setErrorMsg('Failed to start location tracking.');
      // Ensure subscription is cleared on error
      locationSubscription.current?.remove();
      locationSubscription.current = null;
    }
  };

  // Effect hook runs on mount
  useEffect(() => {
    // Immediately request permission when the hook mounts
    requestPermission();

    // Cleanup function: This runs when the component unmounts
    return () => {
      // Remove the location subscription to prevent memory leaks
      locationSubscription.current?.remove();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Return the location data, error message, permission status, and the request function
  return { location, errorMsg, permissionStatus, requestPermission };
};

export default useLiveLocation;
