import { components } from '../../openapi';

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

type ErrorCode =
  | components['schemas']['GroupErrorCode']
  | components['schemas']['AuthErrorCode']
  | components['schemas']['InternalErrorCode'];

export const NAMESPACE = 'src/api/errors/groups';
export const TRANSLATIONS: Record<string, Record<ErrorCode, string>> = {
  en: {
    GROUP_NOT_FOUND:
      'The specified group could not be found. Please make sure you are entering the correct code.',
    USER_ALREADY_IN_GROUP: 'You are already a member of the group.',
    USER_NOT_FOUND: 'The specified user could not be found.',
    USER_NOT_IN_GROUP: 'The user is not a member of the group.',
    MISSING_TOKEN: 'Authentication token is missing. Please log in.',
    INVALID_TOKEN: 'Your session is invalid. Please log in again.',
    EXPIRED_TOKEN: 'Your session has expired. Please log in again.',
    INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
  },
  pl: {
    GROUP_NOT_FOUND: 'Grupa nie znaleziona. Sprawdź czy wpisałeś poprawny kod.',
    USER_ALREADY_IN_GROUP: 'Jesteś już członkiem grupy.',
    USER_NOT_FOUND: 'Użytkownik nie znaleziony.',
    USER_NOT_IN_GROUP: 'Użytkownik nie jest członkiem grupy.',
    MISSING_TOKEN: 'Brak tokenu uwierzytelniającego. Proszę się zalogować.',
    INVALID_TOKEN: 'Twoja sesja jest nieprawidłowa. Proszę zalogować się ponownie.',
    EXPIRED_TOKEN: 'Twoja sesja wygasła. Proszę zalogować się ponownie.',
    INTERNAL_ERROR: 'Wystąpił wewnętrzny błąd. Proszę spróbować ponownie później.',
  },
};

export const useGroupErrorTranslations = () => useTypedTranslation(NAMESPACE, TRANSLATIONS);
