import { jwtDecode } from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { useAuth } from '@/src/context/authContext';

// --- Constants ---
// Should match REFRESH_THRESHOLD_SECONDS in authContext.tsx
const REFRESH_THRESHOLD_SECONDS = 5 * 60; // 300 seconds

// --- Types ---
interface JwtPayload {
  exp: number; // Expiration time (Unix timestamp in seconds)
  [key: string]: any; // Allows for other properties in the payload
}

// --- Helper Functions ---
/**
 * Formats a total number of seconds into a readable "Xm Ys" string.
 * Handles null, negative, and zero values appropriately.
 * @param totalSeconds The total seconds to format, or null.
 * @returns A formatted string (e.g., "5m 00s", "Expired", "N/A").
 */
const formatTime = (totalSeconds: number | null): string => {
  if (totalSeconds === null || totalSeconds < 0) {
    return 'N/A';
  }
  if (totalSeconds === 0) {
    return 'Expired';
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
};

/**
 * Attempts to decode a JWT and extract its expiration timestamp.
 * @param token The JWT string, or null.
 * @returns The expiration timestamp in milliseconds since the Unix epoch, or null if invalid/not present.
 */
const getTokenExpiryTimestamp = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    // Ensure 'exp' exists and is a number before converting to milliseconds
    return decoded.exp && typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch (error) {
    // Treat decoding errors or missing 'exp' as token having no valid expiry
    return null;
  }
};

// --- Debug Component ---
/**
 * Renders a panel displaying authentication status, token expiration countdown,
 * refresh trigger countdown, and any relevant errors from the AuthContext.
 * Intended for development/debugging purposes.
 */
const DebugAuthInfo: React.FC = () => {
  // Consume authentication state from context
  const { token, isInitializing, isLoading, isRefreshing, error } = useAuth();

  // Local state derived from context for display updates
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [triggerRefreshInSeconds, setTriggerRefreshInSeconds] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');

  // Effect to decode the token and set the expiry timestamp whenever the token changes.
  useEffect(() => {
    setExpiryTimestamp(getTokenExpiryTimestamp(token));
  }, [token]);

  // Effect to run a timer that updates display values (status, remaining times) every second.
  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      let currentStatus = 'Logged Out'; // Default status
      let currentRemaining: number | null = null;
      let currentTrigger: number | null = null;

      if (isInitializing) {
        currentStatus = 'Initializing...';
      } else if (token && expiryTimestamp) {
        // Calculate remaining time if logged in and expiry is known
        currentRemaining = Math.max(0, Math.floor((expiryTimestamp - now) / 1000));
        currentTrigger = Math.max(0, currentRemaining - REFRESH_THRESHOLD_SECONDS);

        // Determine the most relevant status string based on current auth state and time
        if (isRefreshing) {
          currentStatus = 'Refreshing Token...';
        } else if (isLoading) {
          // Covers initial load, login, registration attempts
          currentStatus = 'Loading/Authenticating...';
        } else if (currentRemaining <= 0) {
          currentStatus = 'Token Expired';
        } else if (currentRemaining <= REFRESH_THRESHOLD_SECONDS) {
          currentStatus = `Active (Refresh in: ${formatTime(currentTrigger)})`;
        } else {
          currentStatus = 'Active (Token Valid)';
        }
      } else if (isLoading) {
        // Loading without a token usually means login/register attempt
        currentStatus = 'Authenticating...';
      }

      // Update local state only if values have actually changed to prevent needless re-renders
      setRemainingSeconds((prev) => (prev !== currentRemaining ? currentRemaining : prev));
      setTriggerRefreshInSeconds((prev) => (prev !== currentTrigger ? currentTrigger : prev));
      setStatus((prev) => (prev !== currentStatus ? currentStatus : prev));
    };

    updateTimers(); // Run immediately to set initial state
    const intervalId = setInterval(updateTimers, 1000); // Set up the recurring timer

    // Cleanup function to clear the interval when the component unmounts or dependencies change
    return () => clearInterval(intervalId);

    // Dependencies: The timer logic needs to re-evaluate whenever these context values change
  }, [token, expiryTimestamp, isInitializing, isLoading, isRefreshing]);

  // Component's rendered output
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Debug Info</Text>

      {/* Status Display */}
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <View style={styles.valueContainer}>
          {(isLoading || isRefreshing || isInitializing) && (
            <ActivityIndicator size="small" color="#fff" style={styles.loader} />
          )}
          <Text style={[styles.value, status.includes('Expired') && styles.expired]}>{status}</Text>
        </View>
      </View>

      {/* Token Expiry Countdown */}
      <View style={styles.row}>
        <Text style={styles.label}>Token Expires In:</Text>
        <Text
          style={[
            styles.value,
            remainingSeconds !== null && remainingSeconds <= 0 && styles.expired, // Expired style
            remainingSeconds !== null &&
              remainingSeconds > 0 &&
              remainingSeconds <= REFRESH_THRESHOLD_SECONDS &&
              styles.warning, // Warning style when close to refresh
          ]}>
          {formatTime(remainingSeconds)}
        </Text>
      </View>

      {/* Refresh Trigger Countdown */}
      <View style={styles.row}>
        <Text style={styles.label}>Refresh Trigger In:</Text>
        <Text style={styles.value}>
          {/* Only display trigger time if token is valid and outside the immediate refresh window */}
          {triggerRefreshInSeconds !== null &&
          remainingSeconds !== null &&
          remainingSeconds > REFRESH_THRESHOLD_SECONDS
            ? formatTime(triggerRefreshInSeconds)
            : 'N/A'}
        </Text>
      </View>

      {/* Token Presence Indicator */}
      <View style={styles.row}>
        <Text style={styles.label}>Has Access Token:</Text>
        <Text style={styles.value}>{token ? 'Yes' : 'No'}</Text>
      </View>

      {/* Last Error Display (if any) */}
      {error && (
        <View style={styles.row}>
          <Text style={styles.label}>Last Error:</Text>
          <Text style={[styles.value, styles.errorText]} numberOfLines={2}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    margin: 10,
    // NOTE: Removed absolute positioning; this component is now meant
    // to be rendered within a normal page flow (like a debug screen).
    // Use `position: 'absolute'` and related properties (bottom, left, right, zIndex)
    // if you need this component to overlay other UI elements.
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    alignItems: 'center',
  },
  label: {
    color: '#ccc',
    fontSize: 11,
    marginRight: 5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 1, // Prevent value text from pushing label off-screen
  },
  value: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 11,
    textAlign: 'right',
    marginLeft: 5, // Add space between loader and text if loader is present
  },
  loader: {
    marginRight: 5,
  },
  expired: {
    color: '#ff7675', // A reddish color for expired/error states
    fontWeight: 'bold',
  },
  warning: {
    color: '#fdcb6e', // An orange/yellow color for warning states (nearing refresh)
  },
  errorText: {
    color: '#ff7675', // Use the same expired color for errors
    fontStyle: 'italic',
  },
});

export default DebugAuthInfo;
