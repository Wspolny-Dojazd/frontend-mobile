import { jwtDecode } from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { useAuth } from '@/src/context/authContext';

// --- Constants ---
// Should match REFRESH_THRESHOLD_SECONDS in authContext.tsx
// TODO: Consider importing from a shared constants file
const REFRESH_THRESHOLD_SECONDS = 5 * 60; // 300 seconds

// --- Types ---
interface JwtPayload {
  exp: number; // Expiration time (Unix timestamp in seconds)
  [key: string]: any;
}

// --- Helper Functions ---
/** Formats seconds into a readable "Xm Ys" string or "Expired" / "N/A". */
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

/** Gets the raw expiry timestamp (in milliseconds) from a JWT string. */
const getTokenExpiryTimestamp = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp && typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch (error) {
    // console.error('DebugAuthInfo: Error decoding token:', error); // Keep console for actual debugging if needed
    return null; // Treat decoding errors as token having no valid expiry
  }
};

// --- Debug Component ---
/**
 * Renders a panel displaying authentication status, token timers, and errors.
 * Intended for development/debugging purposes. Consumes AuthContext.
 */
const DebugAuthInfo: React.FC = () => {
  const { token, isInitializing, isLoading, isRefreshing, error } = useAuth();

  // Local state derived from context for display purposes
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [triggerRefreshInSeconds, setTriggerRefreshInSeconds] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');

  // Effect to decode token and set expiry timestamp only when the token string changes.
  useEffect(() => {
    setExpiryTimestamp(getTokenExpiryTimestamp(token));
  }, [token]);

  // Effect to run a timer that updates display values (status, remaining times) every second.
  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      let currentStatus = 'Logged Out'; // Default assumption
      let currentRemaining: number | null = null;
      let currentTrigger: number | null = null;

      if (isInitializing) {
        currentStatus = 'Initializing...';
      } else if (token && expiryTimestamp) {
        // Only calculate if logged in and expiry is known
        currentRemaining = Math.max(0, Math.floor((expiryTimestamp - now) / 1000));
        currentTrigger = Math.max(0, currentRemaining - REFRESH_THRESHOLD_SECONDS);

        // Determine the most relevant status string based on context state
        if (isRefreshing) {
          currentStatus = 'Refreshing Token...';
        } else if (isLoading) {
          // isLoading covers init, login, register
          currentStatus = 'Loading...';
        } else if (currentRemaining <= 0) {
          currentStatus = 'Token Expired';
        } else if (currentRemaining <= REFRESH_THRESHOLD_SECONDS) {
          currentStatus = `Active (Refresh Due: ${formatTime(currentTrigger)})`;
        } else {
          currentStatus = 'Active (Token Valid)';
        }
      } else if (isLoading) {
        // Loading without token usually means login/register attempt
        currentStatus = 'Authenticating...';
      }

      // Update local state efficiently, only if values have changed
      setRemainingSeconds((prev) => (prev !== currentRemaining ? currentRemaining : prev));
      setTriggerRefreshInSeconds((prev) => (prev !== currentTrigger ? currentTrigger : prev));
      setStatus((prev) => (prev !== currentStatus ? currentStatus : prev));
    };

    updateTimers(); // Run once immediately
    const intervalId = setInterval(updateTimers, 1000); // Setup interval timer

    return () => clearInterval(intervalId); // Cleanup interval on unmount or dependency change

    // Dependencies determine when to reset the interval timer logic
  }, [token, expiryTimestamp, isInitializing, isLoading, isRefreshing]);

  // Component's rendered output
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Debug Info</Text>
      {/* Display Status */}
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <View style={styles.valueContainer}>
          {/* Show spinner during loading/refreshing states */}
          {(isLoading || isRefreshing || isInitializing) && (
            <ActivityIndicator size="small" color="#fff" style={styles.loader} />
          )}
          <Text style={[styles.value, status.includes('Expired') && styles.expired]}>{status}</Text>
        </View>
      </View>
      {/* Display Token Expiry Countdown */}
      <View style={styles.row}>
        <Text style={styles.label}>Token Expires In:</Text>
        <Text
          style={[
            styles.value,
            remainingSeconds !== null && remainingSeconds <= 0 && styles.expired,
            remainingSeconds !== null &&
              remainingSeconds > 0 &&
              remainingSeconds <= REFRESH_THRESHOLD_SECONDS &&
              styles.warning,
          ]}>
          {formatTime(remainingSeconds)}
        </Text>
      </View>
      {/* Display Refresh Trigger Countdown */}
      <View style={styles.row}>
        <Text style={styles.label}>Refresh Trigger In:</Text>
        <Text style={styles.value}>
          {/* Only show trigger time if applicable (token valid and not yet within threshold) */}
          {triggerRefreshInSeconds !== null &&
          remainingSeconds !== null &&
          remainingSeconds > REFRESH_THRESHOLD_SECONDS
            ? formatTime(triggerRefreshInSeconds)
            : 'N/A'}
        </Text>
      </View>
      {/* Display Token Presence */}
      <View style={styles.row}>
        <Text style={styles.label}>Has Access Token:</Text>
        <Text style={styles.value}>{token ? 'Yes' : 'No'}</Text>
      </View>
      {/* Display Last Error */}
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
    // to be rendered within a normal page flow (like /debug-auth).
    // Use `position: 'absolute'` and related properties (bottom, left, right, zIndex)
    // if you want this component to overlay other UI elements directly.
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
    flexShrink: 1,
  },
  value: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 11,
    textAlign: 'right',
    marginLeft: 5,
  },
  loader: {
    marginRight: 5,
  },
  expired: {
    // Style for expired token status/time
    color: '#ff7675',
    fontWeight: 'bold',
  },
  warning: {
    // Style for time when nearing expiry threshold
    color: '#fdcb6e',
  },
  errorText: {
    // Style for displaying error messages
    color: '#ff7675',
    fontStyle: 'italic',
  },
});

export default DebugAuthInfo;
