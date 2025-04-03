import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { $api } from '@/src/api/api';
import { useAuth } from '@/src/context/authContext';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';

interface JoinGroupScreenProps {
  onBack: () => void;
}

export default function JoinGroupScreen({ onBack }: JoinGroupScreenProps) {
  const [code, setCode] = useState('');
  const { token } = useAuth();
  const NAMESPACE = 'app/transit/joinGroup';
  const TRANSLATIONS = {
    en: {
      enterCode: 'Enter code',
      joinTrip: 'Join the trip',
      confirm: 'Confirm',
    },
    pl: {
      enterCode: 'Wpisz kod',
      joinTrip: 'Dołącz do przejazdu',
      confirm: 'Potwierdź',
    },
  };
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
  const mutatuionJoinGroup = $api.useMutation('post', '/api/groups/join/code/{code}');

  const handleJoinGroup = () => {
    mutatuionJoinGroup.mutate(
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { path: { code: code } },
      },
      {
        onSuccess: () => {
          onBack();
        },
        onError: (error) => {
          console.error('Error creating group:', error);
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex min-h-full items-center justify-center bg-[--background] px-8 dark:bg-[--background]">
      <TouchableOpacity className="absolute left-4 top-40" onPress={onBack}>
        <ArrowLeft size={24} color="white" />
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-black dark:text-white">{t('enterCode')}</Text>
      <Text className="mb-4 text-gray-600 dark:text-gray-400">{t('joinTrip')}</Text>
      <View className="w-full flex-row items-center rounded-lg bg-gray-200 p-4">
        <Text className="text-gray-500">#</Text>
        <TextInput
          className="ml-2 flex-1 text-lg text-gray-900 dark:text-black"
          placeholder="000 000"
          keyboardType="numeric"
          value={code}
          onChangeText={setCode}
        />
      </View>
      <TouchableOpacity
        className="mt-4 flex-row items-center justify-center rounded-lg bg-[--primary] p-4"
        onPress={handleJoinGroup}>
        <Text className="ml-2 text-white">{t('confirm')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
