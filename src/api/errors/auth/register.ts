import { components } from '../../openapi'; // Adjust path

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

export const NAMESPACE = 'src/api/errors/auth/register';
type ErrorCode =
  | components['schemas']['RegisterErrorCode']
  | 'INTERNAL_ERROR'
  | 'PASSWORD_TOO_SHORT';

export const TRANSLATIONS: Record<string, Record<ErrorCode, string>> = {
  en: {
    EMAIL_ALREADY_USED: 'This email address is already registered.',
    INVALID_EMAIL_FORMAT: 'The email format is invalid.',
    VALIDATION_ERROR: 'Registration validation failed. Please check your input.',
    USERNAME_ALREADY_USED: 'This username is already registered.',
    USERNAME_VALIDATION_ERROR: 'Username validation failed. Please check your input.',
    USERNAME_RESERVED: 'This username is reserved for internal use.',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
    INTERNAL_ERROR: 'An internal error occurred. Please try again.',
  },
  pl: {
    EMAIL_ALREADY_USED: 'Ten adres email jest już zarejestrowany.',
    INVALID_EMAIL_FORMAT: 'Format adresu email jest nieprawidłowy.',
    VALIDATION_ERROR: 'Błąd walidacji rejestracji. Proszę sprawdzić wprowadzone dane.',
    USERNAME_ALREADY_USED: 'Ta nazwa użytkownika jest już zarejestrowana.',
    USERNAME_VALIDATION_ERROR:
      'Nazwa użytkownika jest nieprawidłowa. Proszę sprawdzić wprowadzone dane.',
    USERNAME_RESERVED: 'Ta nazwa użytkownika jest zarezerwowana dla wewnętrznego użycia.',
    PASSWORD_TOO_SHORT: 'Hasło musi mieć co najmniej 8 znaków.',
    INTERNAL_ERROR: 'Wystąpił błąd wewnętrzny. Spróbuj ponownie.',
  },
};

export const useRegisterErrorTranslations = () => useTypedTranslation(NAMESPACE, TRANSLATIONS);
