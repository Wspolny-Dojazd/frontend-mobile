import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Separator } from '@/src/components/ui/separator';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { ChevronLeft } from '@/src/lib/icons';

const NAMESPACE = 'profile/preferences';
const TRANSLATIONS = {
  en: {
    preferences: 'Preferences',
    unit_metric: 'Unit of measurement',
    hour_format: 'Hour format',
    metricLabels: {
      metric: 'Metric',
      imperial: 'Imperial',
    },
    hourLabels: {
      GGMM: 'GG:MM',
    },
  },
  pl: {
    preferences: 'Preferencje',
    unit_metric: 'Jednostka miary',
    hour_format: 'Format godziny',
    metricLabels: {
      metric: 'Metryczny',
      imperial: 'Imperialny',
    },
    hourLabels: {
      GGMM: 'GG:MM',
    },
  },
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

      <View className="flex w-full flex-row items-center justify-between px-8 py-3">
        <Label className="text-base font-medium text-gray-700">{t('unit_metric')}</Label>

        <Select>
          <SelectTrigger className="w-[140px] justify-end border-0 bg-transparent p-0">
            <View className="flex flex-row items-center">
              <SelectValue
                className="mr-1 text-base text-gray-500"
                placeholder={t('unit_metric')}
              />
            </View>
          </SelectTrigger>
          <SelectContent insets={contentInsets} className="w-[180px]">
            <SelectGroup>
              <SelectItem label="Metric" value={t('metricLabels.metric')}>
                {t('metricLabels.metric')}
              </SelectItem>
              <SelectItem label="Imperial" value={t('metricLabels.imperial')}>
                {t('metricLabels.imperial')}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="w-full px-8">
        <Separator />
      </View>
      <View className="flex w-full flex-row items-center justify-between px-8 py-3">
        <Label className="text-base font-medium text-gray-700">{t('hour_format')}</Label>

        <Select>
          <SelectTrigger className="w-[140px] justify-end border-0 bg-transparent p-0">
            <View className="flex flex-row items-center">
              <SelectValue
                className="mr-1 text-base text-gray-500"
                placeholder={t('hour_format')}
              />
            </View>
          </SelectTrigger>
          <SelectContent insets={contentInsets} className="w-[180px]">
            <SelectGroup>
              <SelectItem label={t('hourLabels.GGMM')} value={t('hourLabels.GGMM')}>
                {t('hourLabels.GGMM')}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="w-full px-8">
        <Separator />
      </View>
    </SafeAreaView>
  );
}
