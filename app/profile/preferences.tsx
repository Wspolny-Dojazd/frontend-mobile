import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/src/components/ui/text';
import { Link, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { ChevronLeft } from '@/src/lib/icons';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Separator } from '@/src/components/ui/separator';

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

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

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

      <Select defaultValue={{ value: 'apple', label: 'Apple' }}>
        <SelectTrigger className="w-[250px]">
          <SelectValue
            className="native:text-lg text-sm text-foreground"
            placeholder="Select a fruit"
          />
        </SelectTrigger>
        <SelectContent insets={contentInsets} className="w-[250px]">
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem label="Apple" value="apple">
              Apple
            </SelectItem>
            <SelectItem label="Banana" value="banana">
              Banana
            </SelectItem>
            <SelectItem label="Blueberry" value="blueberry">
              Blueberry
            </SelectItem>
            <SelectItem label="Grapes" value="grapes">
              Grapes
            </SelectItem>
            <SelectItem label="Pineapple" value="pineapple">
              Pineapple
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {/* <Link href="/tabs/profile">
        <Text>(DEBUG) Go to profile</Text>
      </Link> */}
    </SafeAreaView>
  );
}
