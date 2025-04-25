import { createContext, useContext, useEffect, ReactNode } from 'react';

import { components } from '../api/openapi';

import i18n from '@/i18n';
import { $api } from '@/src/api/api';
import { useAuth } from '@/src/context/authContext';
import { useColorScheme } from '@/src/lib/useColorScheme';

type UserConfigurationDto = components['schemas']['UserConfigurationDto'];

export function UserPreferencesProvider() {
  const { token } = useAuth();
  const { setColorScheme } = useColorScheme();

  const userConfigQuery = $api.useQuery(
    'get',
    '/api/user-configuration',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      enabled: !!token,
    }
  );

  useEffect(() => {
    if (userConfigQuery.data) {
      const data = userConfigQuery.data as UserConfigurationDto;

      // Apply theme
      if (data.theme === 'Dark' || data.theme === 'Light') {
        setColorScheme(data.theme.toLowerCase() as 'dark' | 'light');
      }

      // Apply language
      if (data.language === 'English') {
        i18n.changeLanguage('en');
      } else if (data.language === 'Polish') {
        i18n.changeLanguage('pl');
      }
    }
  }, [userConfigQuery.data]);

  return <></>;
}
