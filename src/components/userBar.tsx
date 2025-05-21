import type { ReactNode } from 'react';
import { View, Image } from 'react-native';

import { Text } from '@/src/components/ui/text';

type UserBarProps = {
  name: string;
  // imageSource: any;
  children?: ReactNode;
  className?: string;
};

export const UserBar = ({ name, children, className = '' }: UserBarProps) => {
  return (
    <View className={`flex-row items-center justify-between px-7 py-4 ${className}`}>
      {/* Main content container */}
      <View className="flex-1 flex-row items-center">
        {/* Avatar */}
        <View className="relative">
          {/* <Image source={imageSource} className="mr-3 h-12 w-12 rounded-full" /> */}
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <Text className="text-lg font-extrabold text-foreground">{name.slice(0, 2)}</Text>
          </View>
        </View>

        {/* Text container */}
        <View className="flex-1">
          <Text className="text-base font-medium">{name}</Text>
        </View>
      </View>

      {/* Buttons container - now accepts children */}
      <View className="flex-row gap-3">{children}</View>
    </View>
  );
};
