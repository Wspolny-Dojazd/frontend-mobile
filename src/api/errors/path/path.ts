import { components } from '../../openapi';

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

type ErrorCode =
  | components['schemas']['GroupPathErrorCode']
  | components['schemas']['AuthErrorCode']
  | components['schemas']['InternalErrorCode'];

export const NAMESPACE = 'src/api/errors/path';
export const TRANSLATIONS: Record<string, Record<ErrorCode, string>> = {
  en: {
    GROUP_NOT_FOUND:
      'The specified group could not be found. Please make sure you are entering the correct code.',
    MISSING_TOKEN: 'Authentication token is missing. Please log in.',
    INVALID_TOKEN: 'Your session is invalid. Please log in again.',
    EXPIRED_TOKEN: 'Your session has expired. Please log in again.',
    INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token.',
    PATH_ALREADY_ACCEPTED: 'The path has already been accepted.',
    PATH_NOT_FOUND: 'The path could not be found.',
    PATH_NOT_IN_GROUP: 'The path is not in the group.',
    INVALID_CURRENT_PASSWORD: 'Invalid current password.',
    USER_NOT_FOUND: 'The specified user could not be found.',
    ACCESS_DENIED: 'You do not have permission to access this resource.',
    INVALID_NICKNAME: 'An unexpected error occurred. Please try again.',
  },
  pl: {
    GROUP_NOT_FOUND: 'Grupa nie znaleziona. Sprawdź czy wpisałeś poprawny kod.',
    MISSING_TOKEN: 'Brak tokenu uwierzytelniającego. Proszę się zalogować.',
    INVALID_TOKEN: 'Twoja sesja jest nieprawidłowa. Proszę zalogować się ponownie.',
    EXPIRED_TOKEN: 'Twoja sesja wygasła. Proszę zalogować się ponownie.',
    INTERNAL_ERROR: 'Wystąpił wewnętrzny błąd. Proszę spróbować ponownie później.',
    INVALID_REFRESH_TOKEN: 'Nieprawidłowy token odświeżania.',
    PATH_ALREADY_ACCEPTED: 'Ścieżka została już zaakceptowana.',
    PATH_NOT_FOUND: 'Ścieżka nie znaleziona.',
    PATH_NOT_IN_GROUP: 'Ścieżka nie należy do grupy.',
    INVALID_CURRENT_PASSWORD: 'Nieprawidłowe hasło.',
    USER_NOT_FOUND: 'Użytkownik nie znaleziony.',
    ACCESS_DENIED: 'Nie masz dostępu do tego zasobu.',
    INVALID_NICKNAME: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
  },
};

export const usePathErrorTranslations = () => useTypedTranslation(NAMESPACE, TRANSLATIONS);
