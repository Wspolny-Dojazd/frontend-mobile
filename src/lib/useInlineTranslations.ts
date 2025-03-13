import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { loadInlineTranslations } from './loadInlineTranslations';

/**
 * A generalized hook that synchronously adds inline translations to i18next
 * and returns the translation function.
 *
 * @param namespace - The namespace for the translation resources.
 * @param translations - An object with keys as language codes and values as translation objects.
 * @returns An object containing the translation function t.
 */
export function useInlineTranslations(namespace: string, translations: Record<string, object>) {
  // Synchronously add resource bundles before the component renders.
  useMemo(() => loadInlineTranslations(namespace, translations), [namespace, translations]);

  // Get the translation function for the given namespace.
  return useTranslation(namespace);
}
