import { ComponentProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import i18n from '@/i18n';
import { loadInlineTranslations } from '@/src/lib/loadInlineTranslations';

const NAMESPACE = 'components/LanguageSelect';
const TRANSLATIONS = {
  en: {
    selectLanguage: 'Select a language',
    pl: 'Polish',
    en: 'English',
  },
  pl: {
    selectLanguage: 'Wybierz język',
    pl: 'Polski',
    en: 'Angielski',
  },
};
loadInlineTranslations(NAMESPACE, TRANSLATIONS);

const LanguageSelect = (props: ComponentProps<typeof Select>) => {
  const { t } = useTranslation(NAMESPACE);
  const [language, setLanguage] = useState(i18n.language);

  const changeLanguage = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  return (
    <View>
      <Select
        value={{ value: language, label: t(language) }}
        onValueChange={(option) => option && changeLanguage(option.value)}
        {...props}>
        <SelectTrigger className="rounded-md border border-gray-300">
          <SelectValue placeholder={t('selectLanguage')} className="text-black dark:text-white" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pl" label={t('pl')}>
            {t('pl')}
          </SelectItem>
          <SelectItem value="en" label={t('en')}>
            {t('en')}
          </SelectItem>
        </SelectContent>
      </Select>
    </View>
  );
};

export default LanguageSelect;
