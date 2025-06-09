// app/transit/join-group.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TouchableOpacity, ToastAndroid } from 'react-native'; // Import ToastAndroid for better error messages
import { SafeAreaView } from 'react-native-safe-area-context';

import { $api } from '@/src/api/api';
import { useGroupErrorTranslations } from '@/src/api/errors/groups/groups';
import { Input } from '@/src/components/ui/input';
import { useAuth } from '@/src/context/authContext';
import useLiveLocation from '@/src/features/map/useLiveLocation'; // Import useLiveLocation
import { ChevronLeft } from '@/src/lib/icons';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';
import { cn } from '@/src/lib/utils';

const NAMESPACE = 'app/transit/joinGroup';
const TRANSLATIONS = {
  en: {
    enterCode: 'Enter code',
    joinTrip: 'Join the trip',
    join: 'Join',
    error: 'Something went wrong...',
    locationPermissionDenied: 'Location permission denied. Map might not center correctly.',
  },
  pl: {
    enterCode: 'Wpisz kod',
    joinTrip: 'Dołącz do przejazdu',
    join: 'Dołącz',
    error: 'Coś poszło nie tak...',
    locationPermissionDenied:
      'Brak uprawnień do lokalizacji. Mapa może nie wyśrodkować się poprawnie.',
  },
};

export default function JoinGroupScreen() {
  const [code, setCode] = useState('');
  const { token } = useAuth();
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
  const router = useRouter();
  const { t: tErrors } = useGroupErrorTranslations();

  const { location, error: locationError } = useLiveLocation(); // Get user's live location and any errors

  const mutationJoinGroup = $api.useMutation('post', '/api/groups/join/code/{code}');

  const handleJoinGroup = () => {
    mutationJoinGroup.mutate(
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { path: { code } },
      },
      {
        onSuccess: (data) => {
          // If location is available, pass it as query parameters
          const params: Record<string, string> = {};
          if (location) {
            params.latitude = location.coords.latitude.toString();
            params.longitude = location.coords.longitude.toString();
          } else if (locationError) {
            // Optionally inform the user if location couldn't be obtained
            ToastAndroid.show(t('locationPermissionDenied'), ToastAndroid.LONG);
          }
          router.replace({
            pathname: `/tabs/transits/${data.id}`,
            params,
          });
        },
        onError: (error) => {
          // Display translated error using ToastAndroid
          ToastAndroid.show(tErrors(error.code) || t('error'), ToastAndroid.SHORT);
          console.error('Error joining group:', error);
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 p-4">
      <TouchableOpacity onPress={() => router.back()} className="p-4">
        <ChevronLeft size={24} className="text-black dark:text-white" />
      </TouchableOpacity>

      <Text className="mx-auto mt-8 text-3xl font-bold text-black dark:text-white">
        {t('enterCode')}
      </Text>

      <Text className="mx-auto mb-16 mt-4 text-gray-600 dark:text-gray-400">{t('joinTrip')}</Text>

      <Input
        leftSection={<Text className="text-xl text-black dark:text-white">#</Text>}
        placeholder="000 000"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
        maxLength={6}
      />

      <TouchableOpacity
        className={cn('mt-4 flex-row items-center justify-center rounded-lg p-4', {
          'bg-primary': code.length === 6,
          'bg-gray-400 dark:bg-gray-800': code.length !== 6,
        })}
        onPress={handleJoinGroup}
        disabled={code.length !== 6 || mutationJoinGroup.isPending}>
        {' '}
        {/* Disable while joining */}
        <Text
          className={cn('ml-2 text-white', {
            'text-gray-500 dark:text-gray-300': code.length !== 6,
          })}>
          {mutationJoinGroup.isPending ? 'Joining...' : t('join')} {/* Show loading state */}
        </Text>
      </TouchableOpacity>

      {mutationJoinGroup.error && mutationJoinGroup.error.code && (
        <View
          className="relative mt-4 rounded-2xl bg-red-100 p-4 px-4 py-3 dark:bg-red-900"
          role="alert">
          <Text className="font-bold text-red-700 dark:text-red-300">{t('error')} </Text>
          <Text className="block text-red-700 dark:text-red-300 sm:inline">
            {tErrors(mutationJoinGroup.error.code)}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
