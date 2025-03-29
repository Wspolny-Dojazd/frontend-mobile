import { TouchableOpacity } from 'react-native';
import { FC } from 'react';
import { MapPin, Crosshair, LucideIcon } from 'lucide-react-native';

type IconButtonProps = {
  icon: keyof typeof icons;
  onPress: () => void;
  className?: string;
};

const icons: Record<string, LucideIcon> = {
  crosshair: Crosshair,
  mapPin: MapPin,
};

export const IconButton: FC<IconButtonProps> = ({ icon, onPress, className }) => {
  const Icon = icons[icon];

  if (!Icon) {
    console.error(`Icon "${icon}" not found.`);
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} className={className} accessibilityRole="button">
      <Icon size={24} />
    </TouchableOpacity>
  );
};
