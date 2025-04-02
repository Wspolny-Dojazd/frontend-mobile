import * as React from 'react';
import { TextInput as RNTextInput, TextInputProps } from 'react-native';

import { Input } from './input';

import { cn } from '@/src/lib/utils';

const InputText = React.forwardRef<RNTextInput, TextInputProps>(({ className, ...props }, ref) => {
  return <Input ref={ref} {...props} className={cn('', className)} />;
});

InputText.displayName = 'TextInput';

export { InputText };
