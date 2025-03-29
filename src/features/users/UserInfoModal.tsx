import { X, UserRoundCheck, ChevronRight } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { View, Modal, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';

import { Text } from '@/src/components/ui/text';
import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.7; // 70% of screen height

const NAMESPACE = 'app/src/components/ui/dialog';
const TRANSLATIONS = {
  en: {
    friendsStatus: 'You are friends',
    sharedRides: 'Shared rides',
    sharedKm: 'Shared kilometers',
    removeFriend: 'Remove friend',
  },
  pl: {
    friendsStatus: 'Jesteście znajomymi',
    sharedRides: 'Wspólne przejazdy',
    sharedKm: 'Wspólne kilometry',
    removeFriend: 'Usuń ze znajomych',
  },
};

type FriendInfoDialogProps = {
  visible: boolean;
  onClose: () => void;
  friend: {
    name: string;
    imageSource: any;
    sharedRides: number;
    sharedKm: number;
  };
  onRemove: () => void;
};

export function FriendInfoDialog({ visible, onClose, friend, onRemove }: FriendInfoDialogProps) {
  const { t } = useTypedTranslation(NAMESPACE, TRANSLATIONS);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height - MODAL_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View className="flex-1 bg-black/50" style={{ opacity: backdropOpacity }}>
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <Animated.View
        className="absolute w-full rounded-t-3xl bg-white p-6"
        style={{
          height: MODAL_HEIGHT,
          transform: [{ translateY: slideAnim }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 20,
          overflow: 'visible',
        }}>
        {/* Profile Image Container */}
        <View className="absolute -top-16 left-0 right-0 items-center">
          <View
            className="relative"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            }}>
            <Image source={friend.imageSource} className="h-32 w-32 rounded-full" />
          </View>
        </View>

        {/* Close Button */}
        <TouchableOpacity className="absolute right-6 top-6 z-10" onPress={onClose}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Content */}
        <View className="mt-16">
          {/* Name and Status */}
          <View className="mb-10 items-center">
            <Text className="text-3xl font-bold">{friend.name}</Text>
            <View className="mt-8 flex-row items-center">
              <UserRoundCheck size={18} strokeWidth={2} color="#3d917c" />
              <Text className="ml-2 text-primary">{t('friendsStatus')}</Text>
            </View>
          </View>

          {/* Stats Container */}
          <View className="mb-8 flex-row justify-around">
            <View className="items-center">
              <Text className="text-3xl font-bold">{friend.sharedRides}</Text>
              <Text>{t('sharedRides')}</Text>
            </View>

            <View className="items-center">
              <Text className="text-3xl font-bold">{friend.sharedKm.toFixed(2)}</Text>
              <Text>{t('sharedKm')}</Text>
            </View>
          </View>

          {/* Remove Friend Button */}
          <TouchableOpacity
            className="b-2 mt-auto w-full flex-row items-center justify-between border-t border-muted px-4 py-3"
            onPress={onRemove}>
            {/* Left side with X icon and text */}
            <View className="flex-row items-center gap-4">
              <View className="rounded-xl bg-red-50 p-2">
                <X size={16} color="#e37590" />
              </View>
              <Text>{t('removeFriend')}</Text>
            </View>

            {/* Right chevron (non-clickable) */}
            <View>
              <ChevronRight size={24} color="#909597" />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}
