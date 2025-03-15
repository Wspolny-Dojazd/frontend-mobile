import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export type Language = 'en' | 'pl';

i18n
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Initialize with configuration options.
  .init({
    lng: Localization.getLocales()[0].languageCode ?? undefined, // set initial language
    fallbackLng: 'en', // use English if detected language is not available
    debug: false, // set to true for debugging

    // Disable escaping because React already does it
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
