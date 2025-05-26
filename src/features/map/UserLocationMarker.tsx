import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';

import { Text } from '@/src/components/ui/text';
import { cn } from '@/src/lib/utils';

type UserLocationMarkerProps = {
  latitude: number;
  longitude: number;
  userName: string;
  isSelected?: boolean;
};

const UserLocationMarker = React.memo(
  ({ latitude, longitude, userName, isSelected = false }: UserLocationMarkerProps) => {
    const initials = userName.slice(0, 2);

    return (
      <Marker
        key={`user-location-marker-${userName}`}
        coordinate={{ latitude, longitude }}
        anchor={{ x: 0.5, y: 0.5 }}
        style={{ overflow: 'visible', zIndex: 2000 }}
        tracksViewChanges={false} // Prevents unnecessary re-renders
      >
        <View
          className={cn(
            'h-10 w-10 flex-row items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-700',
            isSelected ? 'border-white bg-primary dark:text-white' : ' bg-white dark:bg-gray-800'
          )}>
          <Text
            className={cn(
              'font-bold',
              isSelected ? 'text-primary-foreground' : 'text-foreground dark:text-gray-300'
            )}>
            {initials}
          </Text>
        </View>
      </Marker>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.latitude === nextProps.latitude &&
      prevProps.longitude === nextProps.longitude &&
      prevProps.userName === nextProps.userName &&
      prevProps.isSelected === nextProps.isSelected
    );
  }
);

UserLocationMarker.displayName = 'UserLocationMarker';

export default UserLocationMarker;
