import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { FC } from 'react';
import { MapPin, Crosshair, LucideIcon } from 'lucide-react-native';

type IconButtonProps = {
  icon: keyof typeof icons;
  onPress: () => void;
  style?: ViewStyle;
};

const icons: Record<string, LucideIcon> = {
  crosshair: Crosshair,
  mapPin: MapPin,
};

export const IconButton: FC<IconButtonProps> = ({ icon, onPress, style }) => {
  const Icon = icons[icon];

  if (!Icon) {
    console.error(`Icon "${icon}" not found.`);
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]} accessibilityRole="button">
      <Icon size={24} />
    </TouchableOpacity>
  );
};

// Default styles for the button
const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});
