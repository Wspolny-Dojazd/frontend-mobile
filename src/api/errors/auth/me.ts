import { components } from '../../openapi';

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

type ErrorCode = components['schemas']['AuthErrorCode'] | components['schemas']['UserErrorCode'];

export const NAMESPACE = 'src/api/errors/auth/me';
export const TRANSLATIONS: Record<string, Record<ErrorCode, string>> = {
  en: {
    MISSING_TOKEN: 'Missing token',
    INVALID_TOKEN: 'Invalid token',
    EXPIRED_TOKEN: 'Expired token',
    USER_NOT_FOUND: 'User not found',
  },
  pl: {
    MISSING_TOKEN: 'Brak tokenu',
    INVALID_TOKEN: 'Nieprawidłowy token',
    EXPIRED_TOKEN: 'Token wygasł',
    USER_NOT_FOUND: 'Użytkownik nie znaleziony',
  },
};

export const useMeErrorTranslations = () => useTypedTranslation(NAMESPACE, TRANSLATIONS);
