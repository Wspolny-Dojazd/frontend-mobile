import { components } from '../../openapi';

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

export const NAMESPACE = 'src/api/errors/auth/login';
type ErrorCode =
  | components['schemas']['LoginErrorCode']
  | components['schemas']['InternalErrorCode'];

export const TRANSLATIONS: Record<string, Record<ErrorCode, string>> = {
  en: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    INVALID_EMAIL_FORMAT: 'The email format is invalid.',
    VALIDATION_ERROR: 'Login validation failed. Please check your input.',
    INTERNAL_ERROR: 'An internal server error occurred. Please try again.',
  },
  pl: {
    INVALID_CREDENTIALS: 'Nieprawidłowy email lub hasło.',
    INVALID_EMAIL_FORMAT: 'Format adresu email jest nieprawidłowy.',
    VALIDATION_ERROR: 'Błąd walidacji logowania. Proszę sprawdzić wprowadzone dane.',
    INTERNAL_ERROR: 'Wystąpił wewnętrzny błąd serwera. Proszę spróbować ponownie.',
  },
};

export const useLoginErrorTranslations = () => useTypedTranslation(NAMESPACE, TRANSLATIONS);
