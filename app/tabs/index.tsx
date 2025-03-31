import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/src/components/ui/text';

export default function App() {
  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col items-center justify-between px-8">
      <Text>Ekran główny</Text>
      <Link href="/map-test" className="dark:text-white">
        (DEBUG) Go to Map Test
      </Link>
      <Link href="/auth/profile" className="dark:text-white">
        (DEBUG) Go to LogOut Page
      </Link>
      <Link href="/search-place" className="dark:text-white">
        (DEBUG) Go to Search Place
      </Link>
    </SafeAreaView>
  );
}
