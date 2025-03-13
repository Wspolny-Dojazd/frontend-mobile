import { useColorScheme } from 'nativewind';
import { View } from 'react-native';

import { EditScreenInfo } from './EditScreenInfo';
import { ThemeToggle } from './ThemeToggle';
import { Text } from './ui/text';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <View className={styles.container}>
      <Text className={styles.title}>{title}</Text>
      <View className={styles.separator} />
      <EditScreenInfo path={path} />
      {/* <Pressable
        className="border border-gray-300 rounded-md p-2 m-2 dark:border-white dark:text-white"
        onPress={() => {
          setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
        }}>
        <Text className="dark:text-white">Change to {colorScheme === 'dark' ? 'light' : 'dark'}</Text>
      </Pressable> */}

      <ThemeToggle />

      <View className="items-center justify-center">
        <Text>Hello, World!</Text>
      </View>

      {children}
    </View>
  );
};
const styles = {
  container: `items-center flex-1 justify-center`,
  separator: `h-[1px] my-7 w-4/5 bg-gray-200`,
  title: `text-xl font-bold`,
};
