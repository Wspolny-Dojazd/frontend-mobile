import React, { ReactNode } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Animated, Easing } from 'react-native';

type BottomSheetProps = {
  children: ReactNode;
  onClose: () => void;
  visible: boolean; // Show or hide the bottom sheet
};

export function BottomSheet({ children, onClose, visible }: BottomSheetProps) {
  const translateY = new Animated.Value(1000); // Start the BottomSheet off-screen

  // Animate the BottomSheet when it becomes visible
  React.useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 1000,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
        <View style={styles.sheet}>{children}</View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  sheet: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: -2 },
  },
});
