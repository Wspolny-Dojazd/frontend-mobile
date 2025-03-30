import * as TabsPrimitive from '@rn-primitives/tabs';
import * as React from 'react';

import { TextClassContext } from '@/src/components/ui/text';
import { cn } from '@/src/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<TabsPrimitive.ListRef, TabsPrimitive.ListProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'native:h-12 native:px-1.5 h-10 items-center justify-center rounded-md p-1 web:inline-flex',
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<TabsPrimitive.TriggerRef, TabsPrimitive.TriggerProps>(
  ({ className, ...props }, ref) => {
    const { value } = TabsPrimitive.useRootContext();
    return (
      <TextClassContext.Provider
        value={cn(
          'text-sm native:text-base font-medium text-muted-foreground web:transition-all',
          value === props.value && 'text-primary'
        )}>
        <TabsPrimitive.Trigger
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium shadow-none web:whitespace-nowrap web:ring-offset-background web:transition-all web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
            props.disabled && 'opacity-50 web:pointer-events-none',
            props.value === value && 'bg-subtle shadow-lg shadow-foreground/10',
            className
          )}
          {...props}
        />
      </TextClassContext.Provider>
    );
  }
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<TabsPrimitive.ContentRef, TabsPrimitive.ContentProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        'web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  )
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
