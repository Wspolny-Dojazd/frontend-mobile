import { View, Text, Pressable } from 'react-native';

import { MoonStar } from '~/lib/icons/MoonStar';
import { Sun } from '~/lib/icons/Sun';
import { useColorScheme } from '~/lib/useColorScheme';

export const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Pressable
      className="rounded-md border border-gray-300 p-4 dark:border-white"
      onPress={toggleColorScheme}>
      {colorScheme === 'dark' ? (
        <MoonStar className="text-white" />
      ) : (
        <Sun className=" text-black" />
      )}
    </Pressable>
  );
};
