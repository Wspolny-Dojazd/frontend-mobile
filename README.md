# Development

## Prerequisites

On computer you need to have Node.js installed.

On phone you need to have Expo Go (SDK 51) app installed. Do not download it from the Play Store, download .apk from the [expo website](https://expo.dev/go?sdkVersion=51&platform=android&device=true). Expo with SDK 52 or greated use new architecture with React 19, which is cumbersome right now, because react-native-maps does not support it yet.

## First time setup

```bash
# Clone the repository
git clone https://github.com/Wspolny-Dojazd/frontend-mobile.git
cd frontend-mobile

# First time you should install dependencies this way (to download expo)
npm install
# Then and next times you should install dependencies this way so expo can install dependencies its way
npx expo install

# Check with doctor that everything is ok
npx expo-doctor

# Run the app
npx expo start --clear
```

## Running options

- You can use `--tunnel` if your computer and phone are not in the same network.
- You can use `--clear` to clear the cache. Using it everytime decreases risk of some issues you would be spending hours on.

## Main libraries to know

- [React <= v18](https://react.dev/)
- [React Native <= v0.74](https://reactnative.dev/)
- [Expo SDK 51](https://docs.expo.dev/)

Styling:

- [Tailwind CSS v3](https://v3.tailwindcss.com/)
- [Nativewind v4](https://www.nativewind.dev/)

Components Library:

- [React Native Reusables](https://github.com/mrzachnugent/react-native-reusables)

Internationalization:

- [i18next](https://www.i18next.com/)

Maps:

- [react-native-maps](https://github.com/react-native-maps/react-native-maps)

## Internationalization guide

If component have text that needs to be translated, we define translations at the top of the file:

```tsx
// ...
import { useTranslation } from 'react-i18next';
import { loadInlineTranslations } from '@/src/lib/loadInlineTranslations';

// Define namespace for translations, it is needed for i18next to work. It fulfills the purpose of some unique identifier for translations.
const NAMESPACE = 'app/(tabs)/index';

// Define translations for supported languages.
const TRANSLATIONS = {
  en: {
    welcome: 'Welcome',
    greeting: 'Hello, {{name}}!',
  },
  pl: {
    welcome: 'Witaj',
    greeting: 'Cześć, {{name}}!',
  },
};

// Load translations.
loadInlineTranslations(NAMESPACE, TRANSLATIONS);

export default function App() {
  // Use useTranslation hook to get translations.
  const { t } = useTranslation(NAMESPACE);

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      {/* Use translations in the component. */}
      <Text>{t('welcome')}</Text>
      {/* You can pass variables to the translation. */}
      <Text>{t('greeting', { name: 'John' })}</Text>

      <ThemeToggle className="mt-4 p-2" />
      <LanguageSelect className="mt-4" />
    </SafeAreaView>
  );
}
```
