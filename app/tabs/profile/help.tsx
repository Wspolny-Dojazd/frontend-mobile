import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { View, Text, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const NAMESPACE = 'profile/help';
const TRANSLATIONS = {
  en: {
    header: 'Need Help?',
    intro:
      "If you encounter any issues, have questions, or want to suggest improvements, we're here to help!",
    instructions:
      'Please submit a help request using the link below. Our team will review your message and get back to you as soon as possible.',
    button: 'Submit a Help Request on GitHub',
    note: 'Tip: Include as much detail as possible, such as steps to reproduce the issue, screenshots, or device information.',
  },
  pl: {
    header: 'Potrzebujesz pomocy?',
    intro:
      'Jeśli napotkasz jakiekolwiek problemy, masz pytania lub chcesz zasugerować ulepszenia, jesteśmy tutaj, aby pomóc!',
    instructions:
      'Zgłoś prośbę o pomoc, korzystając z poniższego linku. Nasz zespół przejrzy Twoją wiadomość i odpowie tak szybko, jak to możliwe.',
    button: 'Zgłoś problem na GitHub',
    note: 'Wskazówka: Dołącz jak najwięcej szczegółów, np. kroki do odtworzenia problemu, zrzuty ekranu lub informacje o urządzeniu.',
  },
};

const HELP_URL = 'https://github.com/Wspolny-Dojazd/frontend-mobile/issues/new';

export default function HelpScreen() {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const router = useRouter();

  return (
    <SafeAreaView className="flex min-h-full flex-1 flex-col px-8">
      <View className="relative mt-4 w-full flex-row items-center justify-center py-4">
        <TouchableOpacity className="absolute left-0 z-10" onPress={() => router.back()}>
          <ChevronLeft size={24} className="text-gray-600 dark:text-gray-400" />
        </TouchableOpacity>
        <Text className="text-center text-2xl font-bold text-foreground">{t('header')}</Text>
      </View>
      <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
        <Text className="mb-3 text-center text-base text-gray-700 dark:text-gray-300">
          {t('intro')}
        </Text>
        <Text className="mb-3 text-center text-base text-gray-700 dark:text-gray-300">
          {t('instructions')}
        </Text>
        <TouchableOpacity
          className="my-4 rounded-lg bg-blue-600 px-6 py-3"
          onPress={() => Linking.openURL(HELP_URL)}>
          <Text className="text-center text-base font-semibold text-white">{t('button')}</Text>
        </TouchableOpacity>
        <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          {t('note')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
