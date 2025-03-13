import { useColorScheme } from 'nativewind';

import { NAV_THEME } from './constants';

export const useTheme = () => {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light;
};
