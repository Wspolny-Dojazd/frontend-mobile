import { useTypedTranslation } from "@/src/hooks/useTypedTranslations";
import { components } from "../../openapi";

export const NAMESPACE = 'src/api/errors/users';
export const TRANSLATIONS: Record<string, Record<components['schemas']['UserErrorCode'], string>> = {
    en: {
        USER_NOT_FOUND: 'User not found',
    },
    pl: {
        USER_NOT_FOUND: 'Użytkownik nie znaleziony',
    },
};

export const useUserErrorTranslations = () => useTypedTranslation(NAMESPACE, TRANSLATIONS);
