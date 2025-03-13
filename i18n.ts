import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import pl from './locales/pl.json';

const resources = {
  en: { translation: en },
  pl: { translation: pl },
};

export type Language = keyof typeof resources;
export const LANGUAGES: Language[] = Object.keys(resources) as Language[];

i18n
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Initialize with configuration options.
  .init({
    // Translation resources
    resources,

    lng: Localization.getLocales()[0].languageCode ?? undefined, // set initial language
    fallbackLng: 'en', // use English if detected language is not available
    debug: false, // set to true for debugging

    // Disable escaping because React already does it
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
