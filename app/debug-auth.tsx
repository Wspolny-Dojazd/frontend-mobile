import { StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Renders the actual debug timers and status information.
import DebugAuthInfo from '@/src/components/DebugAuthInfo';

/**
 * A standalone screen component purely for displaying authentication debug information.
 * Intended for development use only.
 */
export default function DebugAuthPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Token Debug Information</Text>
        {/* The DebugAuthInfo component fetches and displays the data */}
        <DebugAuthInfo />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flexGrow: 1,
    padding: 10,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    marginTop: 10,
  },
});
