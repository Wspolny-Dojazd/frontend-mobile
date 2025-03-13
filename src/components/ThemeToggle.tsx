import { Pressable, PressableProps } from 'react-native';

import { MoonStar } from '@/src/lib/icons/MoonStar';
import { Sun } from '@/src/lib/icons/Sun';
import { useColorScheme } from '@/src/lib/useColorScheme';
import { cn } from '@/src/lib/utils';

export const ThemeToggle = (props: PressableProps & { iconClassName?: string }) => {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Pressable
      onPress={toggleColorScheme}
      {...props}
      className={cn('rounded-md border border-gray-300 p-4 dark:border-white', props.className)}>
      {colorScheme === 'dark' ? (
        <MoonStar className={cn('text-white', props.iconClassName)} />
      ) : (
        <Sun className={cn(' text-black', props.iconClassName)} />
      )}
    </Pressable>
  );
};
