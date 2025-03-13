import i18next from 'i18next';

import { Language } from '@/i18n';

export const loadInlineTranslations = (
  namespace: string,
  translations: Record<Language, object>
) => {
  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18next.hasResourceBundle(lng, namespace)) {
      i18next.addResourceBundle(lng, namespace, resources);
    }
  });
};
