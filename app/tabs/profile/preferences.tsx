import { useRouter } from 'expo-router';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/src/context/authContext';
import { $api } from '@/src/api/api';
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
import { Button } from '@/src/components/ui/button';
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
      TwelveHour: '12 Hour',
      TwentyFourHour: '24 Hour',
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
    saveButton: 'Save changes',
    saveSuccess: 'Preferences saved successfully',
    saveError: 'Error saving preferences, try again later...',
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
      TwelveHour: '12-godzinny',
      TwentyFourHour: '24-godzinny',
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
    saveButton: 'Zapisz zmiany',
    saveSuccess: 'Preferencje zapisane pomyślnie',
    saveError: 'Błąd podczas zapisywania preferencji, spróbuj ponownie później...',
  },
};

type UserConfigurationDto = {
  distanceUnit: 'Kilometers' | 'Miles';
  language: 'Polish' | 'English';
  theme: 'Dark' | 'Light';
  timeSystem: 'TwelveHour' | 'TwentyFourHour';
};

export default function App() {
  const router = useRouter();
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [distanceUnit, setDistanceUnit] = useState<'Kilometers' | 'Miles'>('Kilometers');
  const [timeSystem, setTimeSystem] = useState<'TwentyFourHour' | 'TwelveHour'>('TwentyFourHour');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedLanguage: Language = useMemo(() => {
    return i18n.language as Language;
  }, [i18n.language]);

  const changeLanguage = (language: Language) => {
    i18n.changeLanguage(language);
  };

  const { token } = useAuth();
  const userConfigMutation = $api.useMutation('put', '/api/user-configuration');

  const userConfigQuery = $api.useQuery('get', '/api/user-configuration', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    if (userConfigQuery.data) {
      const config = userConfigQuery.data as UserConfigurationDto;
      setDistanceUnit(config.distanceUnit);
      setTimeSystem(config.timeSystem);

      if (config.theme === 'Dark' || config.theme === 'Light') {
        setColorScheme(config.theme.toLowerCase() as 'dark' | 'light');
      }

      if (config.language === 'English') {
        changeLanguage('en');
      } else if (config.language === 'Polish') {
        changeLanguage('pl');
      }
    }
  }, [userConfigQuery.data]);

  const savePreferences = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSaveMessage('');

    const languageValue: 'English' | 'Polish' = selectedLanguage === 'en' ? 'English' : 'Polish';

    const themeValue: 'Light' | 'Dark' = colorScheme === 'light' ? 'Light' : 'Dark';

    const requestBody: UserConfigurationDto = {
      distanceUnit,
      timeSystem,
      language: languageValue,
      theme: themeValue,
    };

    try {
      await userConfigMutation.mutateAsync({
        body: requestBody,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSaveMessage(t('saveSuccess'));
    } catch (err: unknown) {
      console.error(err);
      setError(t('saveError'));
    } finally {
      setIsSaving(false);
    }
  }, [token, userConfigMutation, distanceUnit, timeSystem, selectedLanguage, colorScheme, t]);

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

        <Select
          value={{
            value: distanceUnit,
            label:
              distanceUnit === 'Kilometers' ? t('metricLabels.metric') : t('metricLabels.imperial'),
          }}
          onValueChange={(option: Option) =>
            option && setDistanceUnit(option.value as 'Kilometers' | 'Miles')
          }>
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
                label={t('metricLabels.metric')}
                value="Kilometers"
                className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                {t('metricLabels.metric')}
              </SelectItem>
              <SelectItem
                label={t('metricLabels.imperial')}
                value="Miles"
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

        <Select
          value={{ value: timeSystem, label: t(`hourLabels.${timeSystem}`) }}
          onValueChange={(option: Option) =>
            option && setTimeSystem(option.value as 'TwelveHour' | 'TwentyFourHour')
          }>
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
                label={t('hourLabels.TwelveHour')}
                value="TwelveHour"
                className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                {t('hourLabels.TwelveHour')}
              </SelectItem>
              <SelectItem
                label={t('hourLabels.TwentyFourHour')}
                value="TwentyFourHour"
                className="text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                {t('hourLabels.TwentyFourHour')}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
      <View className="w-full px-8">
        <Separator className="bg-gray-200 dark:bg-gray-700" />
      </View>

      {/* Status Messages */}
      {saveMessage && (
        <View className="px-8 pt-2">
          <Text className="text-green-600">{saveMessage}</Text>
        </View>
      )}
      {error && (
        <View className="px-8 pt-2">
          <Text className="text-red-600">{error}</Text>
        </View>
      )}

      {/* Save Button */}
      <View className="p-8">
        <Button
          onPress={savePreferences}
          disabled={isSaving}
          className="mt-6 w-full rounded-2xl text-center">
          <Text>{isSaving ? '...' : t('saveButton')}</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
