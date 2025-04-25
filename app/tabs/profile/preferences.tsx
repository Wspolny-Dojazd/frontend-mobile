import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import i18n, { Language } from '@/i18n';
import { $api } from '@/src/api/api';
import { usePreferencesErrorTranslations } from '@/src/api/errors/profile/preferences';
import { components } from '@/src/api/openapi';
import { Button } from '@/src/components/ui/button';
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
import { useAuth } from '@/src/context/authContext';
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
    },
    languageLabels: {
      en: 'English',
      pl: 'Polish',
    },
    saveButton: 'Save changes',
    saveSuccess: 'Preferences saved successfully',
    saveError: 'Error saving preferences, try again later...',
    loading: 'Loading...',
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
    },
    languageLabels: {
      en: 'Angielski',
      pl: 'Polski',
    },
    saveButton: 'Zapisz zmiany',
    saveSuccess: 'Preferencje zapisane pomyślnie',
    saveError: 'Błąd podczas zapisywania preferencji, spróbuj ponownie później...',
    loading: 'Ładowanie...',
  },
};

type UserConfigurationDto = components['schemas']['UserConfigurationDto'];

type PreferencesFormValues = {
  distanceUnit: 'Kilometers' | 'Miles';
  timeSystem: 'TwentyFourHour' | 'TwelveHour';
  theme: 'light' | 'dark';
  language: Language;
};

const PreferenceItem = ({ label, children }: { label: string; children: React.ReactNode }) => {
  return (
    <>
      <View className="flex w-full flex-row items-center justify-between px-8 py-3">
        <Label className="text-base font-medium text-gray-700 dark:text-gray-300">{label}</Label>
        {children}
      </View>
      <View className="w-full px-8">
        <Separator className="bg-gray-200 dark:bg-gray-700" />
      </View>
    </>
  );
};

export default function Preferences() {
  const router = useRouter();
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const { t: translateError } = usePreferencesErrorTranslations();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const configLoadedRef = useRef(false);
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<PreferencesFormValues>({
    defaultValues: {
      distanceUnit: 'Kilometers',
      timeSystem: 'TwentyFourHour',
      theme: colorScheme === 'dark' ? 'dark' : 'light',
      language: i18n.language as Language,
    },
  });

  // Watch form values
  const watchTheme = watch('theme');
  const watchLanguage = watch('language');

  // Update external state when form values change
  useEffect(() => {
    if (watchTheme) {
      setColorScheme(watchTheme);
    }
  }, [watchTheme, setColorScheme]);

  useEffect(() => {
    if (watchLanguage && watchLanguage !== i18n.language) {
      i18n.changeLanguage(watchLanguage);
    }
  }, [watchLanguage]);

  const [saveMessage, setSaveMessage] = useState('');

  const userConfigMutation = $api.useMutation('put', '/api/user-configuration');

  const userConfigQuery = $api.useQuery('get', '/api/user-configuration', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const isLoading = userConfigQuery.isLoading;

  useEffect(() => {
    if (userConfigQuery.data && !configLoadedRef.current) {
      const config = userConfigQuery.data as UserConfigurationDto;
      setValue('distanceUnit', config.distanceUnit);
      setValue('timeSystem', config.timeSystem);

      if (config.theme === 'Dark' || config.theme === 'Light') {
        setValue('theme', config.theme.toLowerCase() as 'dark' | 'light');
      }

      if (config.language === 'English') {
        setValue('language', 'en');
      } else if (config.language === 'Polish') {
        setValue('language', 'pl');
      }

      configLoadedRef.current = true;
    }
  }, [userConfigQuery.data, setValue]);

  const onSubmit = useCallback(
    async (data: PreferencesFormValues) => {
      setSaveMessage('');

      const languageValue: 'English' | 'Polish' = data.language === 'en' ? 'English' : 'Polish';
      const themeValue: 'Light' | 'Dark' = data.theme === 'light' ? 'Light' : 'Dark';

      const requestBody: UserConfigurationDto = {
        distanceUnit: data.distanceUnit,
        timeSystem: data.timeSystem,
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
      } catch (err) {
        console.error(err);
      }
    },
    [token, userConfigMutation, t]
  );

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text className="mt-4 text-gray-700 dark:text-gray-300">{t('loading')}</Text>
      </SafeAreaView>
    );
  }

  const errorMessage = userConfigMutation.error?.code
    ? translateError(userConfigMutation.error.code)
    : userConfigMutation.isError
      ? translateError('INTERNAL_ERROR')
      : null;

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
      <PreferenceItem label={t('theme')}>
        <Controller
          control={control}
          name="theme"
          render={({ field: { onChange, value } }) => (
            <Select
              value={{ value, label: t(`themeLabels.${value}`) }}
              onValueChange={(option: Option) =>
                option && onChange(option.value as 'light' | 'dark')
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
          )}
        />
      </PreferenceItem>

      {/* Language Section */}
      <PreferenceItem label={t('language')}>
        <Controller
          control={control}
          name="language"
          render={({ field: { onChange, value } }) => (
            <Select
              value={{ value, label: t(`languageLabels.${value}`) }}
              onValueChange={(option: Option) => option && onChange(option.value as Language)}>
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
          )}
        />
      </PreferenceItem>

      {/* Unit of Measurement Section */}
      <PreferenceItem label={t('unit_metric')}>
        <Controller
          control={control}
          name="distanceUnit"
          render={({ field: { onChange, value } }) => (
            <Select
              value={{
                value,
                label:
                  value === 'Kilometers' ? t('metricLabels.metric') : t('metricLabels.imperial'),
              }}
              onValueChange={(option: Option) =>
                option && onChange(option.value as 'Kilometers' | 'Miles')
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
          )}
        />
      </PreferenceItem>

      {/* Hour Format Section */}
      <PreferenceItem label={t('hour_format')}>
        <Controller
          control={control}
          name="timeSystem"
          render={({ field: { onChange, value } }) => (
            <Select
              value={{ value, label: t(`hourLabels.${value}`) }}
              onValueChange={(option: Option) =>
                option && onChange(option.value as 'TwelveHour' | 'TwentyFourHour')
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
          )}
        />
      </PreferenceItem>

      {/* Status Messages */}
      {saveMessage && (
        <View className="px-8 pt-2">
          <Text className="text-green-600">{saveMessage}</Text>
        </View>
      )}
      {errorMessage && (
        <View className="px-8 pt-2">
          <Text className="text-red-600">{errorMessage}</Text>
        </View>
      )}

      {/* Save Button */}
      <View className="p-8">
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="mt-6 w-full rounded-2xl text-center">
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text>{t('saveButton')}</Text>
          )}
        </Button>
      </View>
    </SafeAreaView>
  );
}
