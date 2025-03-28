import { View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Image } from 'react-native';
import type { ReactNode } from 'react';

type UserBarProps = {
  name: string;
  imageSource: any;
  children?: ReactNode;
};

export const UserBar = ({ 
  name, 
  imageSource, 
  children 
}: UserBarProps) => {
  return (
    <View className="flex-row items-center justify-between px-7 py-4 border-t border-gray-100">
      {/* Main content container */}
      <View className="flex-row items-center flex-1">
        {/* Image container */}
        <View className="relative">
          <Image
            source={imageSource}
            className="w-12 h-12 rounded-full mr-3"
          />
        </View>
        
        {/* Text container */}
        <View className="flex-1">
          <Text className="font-medium text-base">{name}</Text>
        </View>
      </View>

      {/* Buttons container - now accepts children */}
      <View className="flex-row gap-3">
        {children}
      </View>
    </View>
  );
};