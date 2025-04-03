import * as React from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import { cn } from '~/lib/utils';

type InputPropsWithSections = TextInputProps & {
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  leftSectionClassName?: string;
  rightSectionClassName?: string;
  containerClassName?: string;
};

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputPropsWithSections>(
  (
    {
      className,
      placeholderClassName,
      leftSection,
      rightSection,
      leftSectionClassName,
      rightSectionClassName,
      containerClassName,
      ...props
    },
    ref
  ) => {
    return (
      <View
        className={cn(
          'flex flex-row items-center justify-between overflow-hidden rounded-xl border border-input  bg-field',
          containerClassName
        )}>
        {leftSection && <View className={cn('px-2', leftSectionClassName)}>{leftSection}</View>}
        <TextInput
          ref={ref}
          className={cn(
            'native:h-12 native:text-lg native:leading-[1.25] h-10 flex-1 px-3 text-base text-black file:border-0 file:bg-transparent file:font-medium placeholder:text-gray-500 web:flex  web:w-full web:py-2 web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 dark:text-white lg:text-sm',
            props.editable === false && 'opacity-50 web:cursor-not-allowed',
            className
          )}
          placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
          {...props}
        />
        {rightSection && <View className={cn('px-2', rightSectionClassName)}>{rightSection}</View>}
      </View>
    );
  }
);

Input.displayName = 'Input';

export { Input };
