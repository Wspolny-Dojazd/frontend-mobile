import * as React from 'react';
import { TextInput as RNTextInput, TextInputProps } from 'react-native';

const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <RNTextInput
        ref={ref}
        style={[
          { width: '100%', borderWidth: 1, marginVertical: 8, padding: 8, borderRadius: 8 },
          style,
        ]}
        {...props}
      />
    );
  }
);
TextInput.displayName = 'TextInput';

export { TextInput };
