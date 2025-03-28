import { useTypedTranslation } from "@/src/hooks/useTypedTranslations";
import { components } from "../../openapi";

export const NAMESPACE = 'src/api/errors/auth/register';
export const TRANSLATIONS: Record<string, Record<components['schemas']['RegisterErrorCode'], string>> = {
    en: {
        EMAIL_ALREADY_USED: 'Email already used',
        INVALID_EMAIL_FORMAT: 'Invalid email format',
        VALIDATION_ERROR: 'Validation error',
    },
    pl: {
        EMAIL_ALREADY_USED: 'Adres email już używany',
        INVALID_EMAIL_FORMAT: 'Nieprawidłowy format adresu email',
        VALIDATION_ERROR: 'Błąd walidacji',
    },
};

export const useRegisterErrorTranslations = () => useTypedTranslation(NAMESPACE, TRANSLATIONS);
