import { components } from '../../openapi';

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

export const NAMESPACE = 'src/api/errors/auth/change-password';

export type ChangePasswordErrorCode = components['schemas']['AuthErrorCode'];

const TRANSLATIONS = {
  en: {
    MISSING_TOKEN: 'Authentication token is missing.',
    INVALID_TOKEN: 'Authentication token is invalid.',
    INVALID_REFRESH_TOKEN: 'Refresh token is invalid.',
    EXPIRED_TOKEN: 'Authentication token has expired.',
    USER_NOT_FOUND: 'User not found.',
    INVALID_CURRENT_PASSWORD: 'Current password is incorrect.',
    INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
    INVALID_NICKNAME: 'An unexpected error occurred. Please try again.',
  },
  pl: {
    MISSING_TOKEN: 'Brak tokenu uwierzytelniania.',
    INVALID_TOKEN: 'Token uwierzytelniania jest nieprawidłowy.',
    INVALID_REFRESH_TOKEN: 'Token odświeżania jest nieprawidłowy.',
    EXPIRED_TOKEN: 'Token uwierzytelniania wygasł.',
    USER_NOT_FOUND: 'Nie znaleziono użytkownika.',
    INVALID_CURRENT_PASSWORD: 'Aktualne hasło jest nieprawidłowe.',
    INTERNAL_ERROR: 'Wystąpił błąd wewnętrzny. Spróbuj ponownie później.',
    INVALID_NICKNAME: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.',
  },
};

export const useChangePasswordErrorTranslations = () => {
  return useTypedTranslation(NAMESPACE, TRANSLATIONS);
};
