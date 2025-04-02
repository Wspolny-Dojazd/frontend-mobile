import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import i18n, { Language } from '@/i18n';
import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/src/components/ui/select';
import { Separator } from '@/src/components/ui/separator';
import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';
import { ChevronLeft } from '@/src/lib/icons';
import { useColorScheme } from '@/src/lib/useColorScheme';

const NAMESPACE = 'profile/preferences';
const TRANSLATIONS = {
  en: {
    preferences: 'Preferences',
    unit_metric: 'Unit of measurement',
    hour_format: 'Hour format',
    theme: 'Theme',
    language: 'Language',
    metricLabels: {
      metric: 'Metric',
      imperial: 'Imperial',
    },
    hourLabels: {
      GGMM: 'GG:MM',
    },
    themeLabels: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    languageLabels: {
      en: 'English',
      pl: 'Polish',
    },
  },
  pl: {
    preferences: 'Preferencje',
    unit_metric: 'Jednostka miary',
    hour_format: 'Format godziny',
    theme: 'Motyw',
    language: 'Język',
    metricLabels: {
      metric: 'Metryczny',
      imperial: 'Imperialny',
    },
    hourLabels: {
      GGMM: 'GG:MM',
    },
    themeLabels: {
      light: 'Jasny',
      dark: 'Ciemny',
      system: 'Systemowy',
    },
    languageLabels: {
      en: 'Angielski',
      pl: 'Polski',
    },
  },
};

export default function App() {
  const router = useRouter();
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const selectedLanguage: Language = useMemo(() => {
    return i18n.language as Language;
  }, [i18n.language]);

  const changeLanguage = (language: Language) => {
    i18n.changeLanguage(language);
  };

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="relative mt-4 w-full flex-row items-center justify-center py-4">
        <TouchableOpacity
          className="absolute left-4 z-10"
          onPress={() => {
            router.back();
          }}>
          <ChevronLeft color={isDark ? '#9ca3af' : '#666'} size={24} />
        </TouchableOpacity>

        <Text className="text-center text-4xl font-semibold text-slate-800 dark:text-white">
          {t('preferences')}
        </Text>
      </View>

      {/* Theme Section */}
      <View className="flex w-full flex-row items-center justify-between px-8 py-3">
        <Label className="text-base font-medium text-gray-700 dark:text-gray-300">
          {t('theme')}
        </Label>

        <Select
          value={{ value: colorScheme, label: t(`themeLabels.${colorScheme}`) }}
          onValueChange={(option: Option) =>
            option && setColorScheme(option.value as 'light' | 'dark' | 'system')
          }>
          <SelectTrigger className="w-[140px] justify-end border-0 bg-transparent p-0">
            <View className="flex flex-row items-center">
              <SelectValue
                className="mr-1 text-base text-gray-500 dark:text-gray-300"
                placeholder={t('theme')}
              />
            </View>
          </SelectTrigger>
          <SelectContent
            insets={contentInsets}
            className="w-[180px] border-gray-200 bg-white dark:border-gray-700 dark:bg-background">
            <SelectGroup>
              <SelectItem
                label={t('themeLabels.light')}
                value="light"
                className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                {t('themeLabels.light')}
              </SelectItem>
              <SelectItem
                label={t('themeLabels.dark')}
                value="dark"
                className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                {t('themeLabels.dark')}
              </SelectItem>
              <SelectItem
                label={t('themeLabels.system')}
                value="system"
                className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                {t('themeLabels.system')}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="w-full px-8">
        <Separator className="bg-gray-200 dark:bg-gray-700" />
      </View>

      {/* Language Section */}
      <View className="flex w-full flex-row items-center justify-between px-8 py-3">
        <Label className="text-base font-medium text-gray-700 dark:text-gray-300">
          {t('language')}
        </Label>

        <Select
          value={{ value: selectedLanguage, label: t(`languageLabels.${selectedLanguage}`) }}
          onValueChange={(option: Option) => option && changeLanguage(option.value as Language)}>
          <SelectTrigger className="w-[140px] justify-end border-0 bg-transparent p-0">
            <View className="flex flex-row items-center">
              <SelectValue
                className="mr-1 text-base text-gray-500 dark:text-gray-300"
                placeholder={t('language')}
              />
            </View>
          </SelectTrigger>
          <SelectContent
            insets={contentInsets}
            className="w-[180px] border-gray-200 bg-white dark:border-gray-700 dark:bg-background">
            <SelectGroup>
              <SelectItem
                label={t('languageLabels.en')}
                value="en"
                className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                {t('languageLabels.en')}
              </SelectItem>
              <SelectItem
                label={t('languageLabels.pl')}
                value="pl"
                className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                {t('languageLabels.pl')}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="w-full px-8">
        <Separator className="bg-gray-200 dark:bg-gray-700" />
      </View>

      {/* Unit of Measurement Section */}
      <View className="flex w-full flex-row items-center justify-between px-8 py-3">
        <Label className="text-base font-medium text-gray-700 dark:text-gray-300">
          {t('unit_metric')}
        </Label>

        <Select>
          <SelectTrigger className="w-[140px] justify-end border-0 bg-transparent p-0">
            <View className="flex flex-row items-center">
              <SelectValue
                className="mr-1 text-base text-gray-500 dark:text-gray-300"
                placeholder={t('unit_metric')}
              />
            </View>
          </SelectTrigger>
          <SelectContent
            insets={contentInsets}
            className="w-[180px] border-gray-200 bg-white dark:border-gray-700 dark:bg-background">
            <SelectGroup>
              <SelectItem
                label="Metric"
                value={t('metricLabels.metric')}
                className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                {t('metricLabels.metric')}
              </SelectItem>
              <SelectItem
                label="Imperial"
                value={t('metricLabels.imperial')}
                className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                {t('metricLabels.imperial')}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="w-full px-8">
        <Separator className="bg-gray-200 dark:bg-gray-700" />
      </View>

      {/* Hour Format Section */}
      <View className="flex w-full flex-row items-center justify-between px-8 py-3">
        <Label className="text-base font-medium text-gray-700 dark:text-gray-300">
          {t('hour_format')}
        </Label>

        <Select>
          <SelectTrigger className="w-[140px] justify-end border-0 bg-transparent p-0">
            <View className="flex flex-row items-center">
              <SelectValue
                className="mr-1 text-base text-gray-500 dark:text-gray-300"
                placeholder={t('hour_format')}
              />
            </View>
          </SelectTrigger>
          <SelectContent
            insets={contentInsets}
            className="w-[180px] border-gray-200 bg-white dark:border-gray-700 dark:bg-background">
            <SelectGroup>
              <SelectItem
                label={t('hourLabels.GGMM')}
                value={t('hourLabels.GGMM')}
                className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                {t('hourLabels.GGMM')}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="w-full px-8">
        <Separator className="bg-gray-200 dark:bg-gray-700" />
      </View>
    </SafeAreaView>
  );
}
