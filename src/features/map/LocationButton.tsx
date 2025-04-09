import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';

import { Locate } from '@/src/lib/icons/Locate';
import { LocateFixed } from '@/src/lib/icons/LocateFixed';
import { LocateOff } from '@/src/lib/icons/LocateOff';
import { cn } from '@/src/lib/utils';

interface LocationButtonProps {
  isLocating: boolean;
  isMapCentered: boolean;
  errorMsg: string | null;
  colorScheme: string | undefined;
  onPress: () => void;
  className?: string;
}

export const LocationButton: React.FC<LocationButtonProps> = ({
  isLocating,
  isMapCentered,
  errorMsg,
  colorScheme,
  onPress,
  className,
}) => {
  // Render the appropriate location icon based on state
  const renderLocationIcon = () => {
    if (isLocating) {
      return <ActivityIndicator size="small" color={colorScheme === 'dark' ? 'white' : 'black'} />;
    } else if (errorMsg) {
      // Location permission not granted
      return (
        <LocateOff size={24} className={colorScheme === 'dark' ? 'text-white' : 'text-black'} />
      );
    } else if (isMapCentered) {
      // Map is centered on user location
      return (
        <LocateFixed size={24} className={colorScheme === 'dark' ? 'text-white' : 'text-black'} />
      );
    } else {
      // Location available but map not centered
      return <Locate size={24} className={colorScheme === 'dark' ? 'text-white' : 'text-black'} />;
    }
  };

  return (
    <TouchableOpacity
      className={cn(
        'absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full shadow-md',
        colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
        className
      )}
      onPress={onPress}>
      {renderLocationIcon()}
    </TouchableOpacity>
  );
};
