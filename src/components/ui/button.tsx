import * as React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  PressableProps,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  onPress: () => void;
  className?: string;
}

const Button = React.forwardRef<View, ButtonProps>(({ title, onPress, style, ...props }, ref) => {
  return (
    <Pressable ref={ref} style={style as StyleProp<ViewStyle>} onPress={onPress} {...props}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 4,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export { Button };
