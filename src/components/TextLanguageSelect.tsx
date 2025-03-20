import { ComponentProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/text';

import i18n from '@/i18n';
import { loadInlineTranslations } from '@/src/lib/loadInlineTranslations';

const NAMESPACE = 'components/LanguageSelect';
const TRANSLATIONS = {
  en: {
    switch: 'Przełącz na',
    lang: 'polski',
  },
  pl: {
    switch: 'Switch to',
    lang: 'English',
  },
};
loadInlineTranslations(NAMESPACE, TRANSLATIONS);

const TextLanguageSelect = (props: ComponentProps<typeof View>) => {
  const { t } = useTranslation(NAMESPACE);
  const [language, setLanguage] = useState(i18n.language);

  const changeLanguage = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  return (
    <View {...props}>
      <Text className="text-sm">
        {t('switch')}{' '}
        <Text
          className="text-primary"
          onPress={() => changeLanguage(language === 'pl' ? 'en' : 'pl')}>
          {t('lang')}
        </Text>
      </Text>
    </View>
  );
};

export default TextLanguageSelect;
