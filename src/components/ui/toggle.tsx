import * as TogglePrimitive from '@rn-primitives/toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';

import { TextClassContext } from '@/src/components/ui/text';
import { cn } from '@/src/lib/utils';

const toggleVariants = cva(
  'web:group web:inline-flex items-center justify-center rounded-md web:ring-offset-background web:transition-colors web:hover:bg-muted active:bg-muted web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent web:hover:bg-accent active:bg-accent active:bg-accent',
      },
      size: {
        default: 'h-10 px-3 native:h-12 native:px-[12]',
        sm: 'h-9 px-2.5 native:h-10 native:px-[9]',
        lg: 'h-11 px-5 native:h-14 native:px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const toggleTextVariants = cva('text-sm native:text-base text-foreground font-medium', {
  variants: {
    variant: {
      default: '',
      outline: 'web:group-hover:text-accent-foreground web:group-active:text-accent-foreground',
    },
    size: {
      default: '',
      sm: '',
      lg: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const Toggle = React.forwardRef<
  TogglePrimitive.RootRef,
  TogglePrimitive.RootProps & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TextClassContext.Provider
    value={cn(
      toggleTextVariants({ variant, size }),
      props.pressed ? 'text-accent-foreground' : 'web:group-hover:text-muted-foreground',
      className
    )}>
    <TogglePrimitive.Root
      ref={ref}
      className={cn(
        toggleVariants({ variant, size }),
        props.disabled && 'opacity-50 web:pointer-events-none',
        props.pressed && 'bg-accent',
        className
      )}
      {...props}
    />
  </TextClassContext.Provider>
));

Toggle.displayName = TogglePrimitive.Root.displayName;

function ToggleIcon({
  className,
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<LucideIcon> & {
  icon: LucideIcon;
}) {
  const textClass = React.useContext(TextClassContext);
  return <Icon className={cn(textClass, className)} {...props} />;
}

export { Toggle, ToggleIcon, toggleTextVariants, toggleVariants };
