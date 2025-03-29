import { components } from '../../openapi';

import { useTypedTranslation } from '@/src/hooks/useTypedTranslations';

export const NAMESPACE = 'src/api/errors/auth/login';
export const TRANSLATIONS: Record<
  string,
  Record<components['schemas']['LoginErrorCode'], string>
> = {
  en: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    INVALID_EMAIL_FORMAT: 'Invalid email format',
    VALIDATION_ERROR: 'Validation error',
  },
  pl: {
    INVALID_CREDENTIALS: 'Nieprawidłowe dane logowania',
    INVALID_EMAIL_FORMAT: 'Nieprawidłowy format adresu email',
    VALIDATION_ERROR: 'Błąd walidacji',
  },
};

export const useLoginErrorTranslations = () => useTypedTranslation(NAMESPACE, TRANSLATIONS);
