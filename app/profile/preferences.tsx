import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/src/components/ui/text';
import { Link, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { ChevronLeft } from '@/src/lib/icons';

const NAMESPACE = 'profile/preferences';
const TRANSLATIONS = {
  en: {
    preferences: 'Preferences',
    unit_metric: 'Unit of measurement',
    hour_format: 'Hour format',
  },
  pl: { preferences: 'Preferencje', unit_metric: 'Jednostka miary', hour_format: 'Format godziny' },
};

export default function App() {
  const router = useRouter();
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);

  return (
    <SafeAreaView className="flex items-center justify-center">
      <View className="relative mt-4 w-full flex-row items-center justify-center py-4">
        <TouchableOpacity
          className="absolute left-4 z-10"
          onPress={() => {
            router.back();
          }}>
          <ChevronLeft color="#666" size={24} />
        </TouchableOpacity>

        <Text className="text-center text-4xl font-semibold text-slate-800">
          {t('preferences')}
        </Text>
      </View>

      <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

      {/* <Link href="/tabs/profile">
        <Text>(DEBUG) Go to profile</Text>
      </Link> */}
    </SafeAreaView>
  );
}
