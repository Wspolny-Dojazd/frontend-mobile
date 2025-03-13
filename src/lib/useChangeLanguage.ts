import { useTranslation } from 'react-i18next';

import { Language } from '@/i18n';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  return {
    language: i18n.language,
    changeLanguage: (language: Language) => {
      i18n.changeLanguage(language);
    },
  };
};
