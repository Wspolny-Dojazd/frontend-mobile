import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface JoinGroupScreenProps {
  onBack: () => void;
}

export default function JoinGroupScreen({ onBack }: JoinGroupScreenProps) {
  const [code, setCode] = useState('');

  return (
    <SafeAreaView className="flex min-h-full items-center justify-center bg-[--background] px-8 dark:bg-[--background]">
      <TouchableOpacity className="absolute left-4 top-40" onPress={onBack}>
        <ArrowLeft size={24} color="white" />
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-black dark:text-white">Wpisz kod</Text>
      <Text className="mb-4 text-gray-600 dark:text-gray-400">Dołącz do przejazdu</Text>
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
      <TouchableOpacity className="mt-4 flex-row items-center justify-center rounded-lg bg-[--primary] p-4">
        <Text className="ml-2 text-white">Potwierdź</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
