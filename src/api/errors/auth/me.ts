import { components } from '../../openapi';

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

export const NAMESPACE = 'src/api/errors/auth/me';
// Combine possible error codes from the /me endpoint (check openapi.json responses: 401, 404)
type ErrorCode = components['schemas']['AuthErrorCode'] | components['schemas']['UserErrorCode'];

export const TRANSLATIONS: Record<string, Record<ErrorCode, string>> = {
  en: {
    // Auth Errors (401)
    MISSING_TOKEN: 'Authentication token is missing. Please log in.',
    INVALID_TOKEN: 'Your session is invalid. Please log in again.',
    EXPIRED_TOKEN: 'Your session has expired. Please log in again.',
    // User Errors (404)
    USER_NOT_FOUND: 'User account not found.',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token.',
    INVALID_CURRENT_PASSWORD: 'Invalid current password.',
  },
  pl: {
    // Auth Errors (401)
    MISSING_TOKEN: 'Brak tokenu uwierzytelniającego. Proszę się zalogować.',
    INVALID_TOKEN: 'Twoja sesja jest nieprawidłowa. Proszę zalogować się ponownie.',
    EXPIRED_TOKEN: 'Twoja sesja wygasła. Proszę zalogować się ponownie.',
    // User Errors (404)
    USER_NOT_FOUND: 'Nie znaleziono konta użytkownika.',
    INVALID_REFRESH_TOKEN: 'Nieprawidłowy token odświeżania.',
    INVALID_CURRENT_PASSWORD: 'Nieprawidłowe hasło.',
  },
};

export const useMeErrorTranslations = () =>
  useTypedTranslation(NAMESPACE, TRANSLATIONS as Record<string, Record<string, string>>);
