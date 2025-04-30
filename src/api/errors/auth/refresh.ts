import { components } from '../../openapi';

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

export const NAMESPACE = 'src/api/errors/auth/refresh';

type RefreshErrorCode =
  | components['schemas']['AuthErrorCode']
  | components['schemas']['UserErrorCode'];

export const TRANSLATIONS: Record<string, Record<RefreshErrorCode, string>> = {
  en: {
    MISSING_TOKEN: 'Your session is invalid or could not be read. Please log in again.',
    USER_NOT_FOUND: 'Associated user account not found. Please log in again.',
    INVALID_TOKEN: 'Your session token is invalid. Please log in again.',
    INVALID_REFRESH_TOKEN: 'Your session token is invalid. Please log in again.',
    EXPIRED_TOKEN: 'Your session has expired. Please log in again.',
  },
  pl: {
    MISSING_TOKEN:
      'Twoja sesja jest nieprawidłowa lub nie można jej odczytać. Proszę zalogować się ponownie.',
    USER_NOT_FOUND: 'Nie znaleziono powiązanego konta użytkownika. Proszę zalogować się ponownie.',
    INVALID_TOKEN: 'Twój token sesji jest nieprawidłowy. Proszę zalogować się ponownie.',
    INVALID_REFRESH_TOKEN: 'Twój token sesji jest nieprawidłowy. Proszę zalogować się ponownie.',
    EXPIRED_TOKEN: 'Twoja sesja wygasła. Proszę zalogować się ponownie.',
  },
};

export const useRefreshTokenErrorTranslations = () =>
  useTypedTranslation(NAMESPACE, TRANSLATIONS as Record<string, Record<string, string>>);
