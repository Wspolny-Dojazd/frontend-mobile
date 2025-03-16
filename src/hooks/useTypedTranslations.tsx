// src/hooks/useTypedTranslation.ts
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Language } from '@/i18n'; // Adjust path as needed
import { loadInlineTranslations } from '@/src/lib/loadInlineTranslations'; // Adjust path as needed

// Utility types
type FlattenKeys<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string
        ? T[K] extends object
          ? `${K}.${FlattenKeys<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type FlattenTranslationKeys<T> = FlattenKeys<T> | keyof T;

// Typed translation hook
export function useTypedTranslation<T extends Record<string, any>>(
  namespace: string,
  translations: Record<Language, T>
) {
  // Load translations into i18next
  useMemo(() => loadInlineTranslations(namespace, translations), [namespace, translations]);

  // Get the t function from react-i18next
  const { t } = useTranslation(namespace);

  // Return t with type safety for flattened keys
  return { t: t as (key: FlattenTranslationKeys<T>, options?: Record<string, any>) => string };
}
