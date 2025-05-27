# Contributions

This project is a group assignment for university studies. Only designated group members are allowed to contribute to this repository. External contributors should not comment, create issues, or participate in any way.

# Development

## Prerequisites

On computer you need to have Node.js installed.

~~On phone you need to have Expo Go (SDK 51) app installed. Do not download it from the Play Store, download .apk from the [expo website](https://expo.dev/go?sdkVersion=51&platform=android&device=true). Expo with SDK 52 or greated use new architecture with React 19, which is cumbersome right now, because react-native-maps does not support it yet.~~

Download this [development build](https://drive.google.com/file/d/1xcgE38d60CNpiQhcmTmt9Q489L385EQv/view?usp=drive_link) and install it on your phone. It is a development build with Expo Go (SDK 51). For some reason the Expo Go app may not work, but this development build does.

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
- You can use `--clear` to clear the cache. U`sing it everytime decreases risk of some issues you would be spending hours on.
- When Expo Go is installed manually using an older version (like we do), a problem can occur because Android automatically upgrades it to the latest version after some time without asking. Therefore, if you see an error indicating that your Expo Go is running SDK 52 while your project is using SDK 51, you need to uninstall Expo Go and then reinstall the version with SDK 51 manually.

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

## Project structure

- app - views and routing
- assets - images, icons, etc.
- src
  - api - code related to backend api, openapi specification, auto-generated ts types for it and configuration for react-query
  - components - reusable components created by us or copied from react-native-reusables or from other places
  - features - if components are big, complex and used in a specific place in app (for example map components), we place it under features folder rather than components
  - hooks - custom hooks, this means stateful functions for reusable logic
  - contexts - React Contexts, used for state management
  - lib - other functions and utilities

## Internationalization guide

If component have text that needs to be translated, we define translations at the top of the file:

```tsx
// ...
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

// Some unique namespace for this component, we can use path for example
const NAMESPACE = 'app/(tabs)/index';
// Define translations for this component
const TRANSLATIONS = {
  en: {
    welcome: 'Welcome',
    greeting: 'Hello, {{name}}!',
    age: 'You are {{age}} years old.',
    nested: {
      key: 'Nested key',
    },
    double: {
      nested: {
        key: 'Nested key 2',
      },
    },
  },
  pl: {
    welcome: 'Witaj',
    greeting: 'Cześć, {{name}}!',
    age: 'Masz {{age}} lat.',
    nested: {
      key: 'Zagnieżdżony klucz',
    },
    double: {
      nested: {
        key: 'Zagnieżdżony klucz 2',
      },
    },
  },
};

export default function App() {
  // Use hook to get translations for this component
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text>{t('welcome')}</Text>
      <Text>{t('greeting', { name: 'John' })}</Text>
      <Text>{t('age', { age: 20 })}</Text>
      <Text>{t('nested.key')}</Text>
      <Text>{t('double.nested.key')}</Text>

      {/* ... */}
    </SafeAreaView>
  );
}
```
