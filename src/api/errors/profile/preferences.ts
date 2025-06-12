import { components } from '../../openapi';

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

type ErrorCode =
  | components['schemas']['UserConfigurationErrorCode']
  | components['schemas']['AuthErrorCode']
  | components['schemas']['InternalErrorCode'];

export const NAMESPACE = 'src/api/errors/profile/preferences';
export const TRANSLATIONS: Record<string, Record<ErrorCode, string>> = {
  en: {
    USER_CONFIGURATION_NOT_FOUND: 'User configuration not found.',
    VALIDATION_ERROR: 'Validation error.',
    MISSING_TOKEN: 'Authentication token is missing. Please log in.',
    INVALID_TOKEN: 'Your session is invalid. Please log in again.',
    EXPIRED_TOKEN: 'Your session has expired. Please log in again.',
    INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token.',
    INVALID_CURRENT_PASSWORD: 'Invalid current password.',
    USER_NOT_FOUND: 'The specified user could not be found.',
    INVALID_NICKNAME: 'An unexpected error occurred. Please try again.',
  },
  pl: {
    USER_CONFIGURATION_NOT_FOUND: 'Konfiguracja użytkownika nie znaleziona.',
    VALIDATION_ERROR: 'Błąd walidacji.',
    MISSING_TOKEN: 'Brak tokenu uwierzytelniającego. Proszę się zalogować.',
    INVALID_TOKEN: 'Twoja sesja jest nieprawidłowa. Proszę zalogować się ponownie.',
    EXPIRED_TOKEN: 'Twoja sesja wygasła. Proszę zalogować się ponownie.',
    INTERNAL_ERROR: 'Wystąpił wewnętrzny błąd. Proszę spróbować ponownie później.',
    INVALID_REFRESH_TOKEN: 'Nieprawidłowy token odświeżania.',
    INVALID_CURRENT_PASSWORD: 'Nieprawidłowe hasło.',
    USER_NOT_FOUND: 'Użytkownik nie znaleziony.',
    INVALID_NICKNAME: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
  },
};

export const usePreferencesErrorTranslations = () => useTypedTranslation(NAMESPACE, TRANSLATIONS);
