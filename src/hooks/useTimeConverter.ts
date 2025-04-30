import { DateTime } from 'luxon';
import { $api } from '../api/api';
import { useAuth } from '../context/authContext';
import { components } from '../api/openapi';

export type TimeVariant = 'date' | 'datetime_seconds' | 'datetime' | 'time_seconds' | 'time';
// Variants:
// 1. 30.04.2025 -> 'date'
// 2. 30.04.2025 13:00:00 -> 'datetime_seconds'
// 3. 30.04.2025 13:00 -> 'datetime'
// 4. 13:00:00 -> 'time_seconds'
// 5. 13:00 -> 'time'


const DEFAULT_TIME_SYSTEM = 'TwentyFourHour';
const DEFAULT_LANGUAGE = 'English';

export const useTimeConverter = () => {
    const { token } = useAuth();

    // Consider adding isLoading/isError if the consuming component needs to react to loading/error states
    const { data /*, isLoading, isError */ } = $api.useQuery(
        'get',
        '/api/user-configuration',
        {
            // Ensure headers are only included if the token exists
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
        {
            enabled: !!token, // Query only runs when the token is available
        }
    );

    const timeUnit = data?.timeSystem ?? DEFAULT_TIME_SYSTEM;
    const language = data?.language ?? DEFAULT_LANGUAGE;

    const getLocaleCode = (lang: components['schemas']['UserConfigurationDto']['language']): string => {
        switch (lang) {
            case 'Polish':
                return 'pl';
            case 'English': // Could specify 'en-GB' or 'en-US' if needed, but 'en' is often sufficient
            default:
                return 'en';
        }
    };
    const localeCode = getLocaleCode(language);

    /**
     * Converts an ISO 8601 datetime string to a localized, formatted string based on user preferences.
     * @param datetime - The input datetime string in ISO 8601 format (e.g., "2025-04-30T13:00:00.000Z").
     * @param variant - The desired output format variant.
     * @returns The formatted datetime string, or an empty string if the input is invalid or an error occurs.
     */
    const convertTime = (datetime: string | null | undefined, variant: TimeVariant): string => {
        if (!datetime) {
            return '';
        }

        try {
            const dateTimeObj = DateTime.fromISO(datetime);

            if (!dateTimeObj.isValid) {
                // Log detailed error for easier debugging
                console.warn(
                    `[useTimeConverter] Invalid date string provided: "${datetime}". Reason: ${dateTimeObj.invalidReason} - ${dateTimeObj.invalidExplanation}`
                );
                return '';
            }

            const is12Hour = timeUnit === 'TwelveHour';
            let formatString = '';

            // Luxon format tokens: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
            switch (variant) {
                case 'date':
                    formatString = 'dd.MM.yyyy';
                    break;
                case 'datetime_seconds':
                    // Use 'HH' for 24-hour, 'hh' for 12-hour, 'a' for AM/PM marker
                    formatString = is12Hour ? 'dd.MM.yyyy hh:mm:ss a' : 'dd.MM.yyyy HH:mm:ss';
                    break;
                case 'datetime':
                    formatString = is12Hour ? 'dd.MM.yyyy hh:mm a' : 'dd.MM.yyyy HH:mm';
                    break;
                case 'time_seconds':
                    formatString = is12Hour ? 'hh:mm:ss a' : 'HH:mm:ss';
                    break;
                case 'time':
                    formatString = is12Hour ? 'hh:mm a' : 'HH:mm';
                    break;
                // This default case should be unreachable due to the TimeVariant type
                default: {
                    // Use exhaustive check to ensure all variants are handled
                    const exhaustiveCheck: never = variant;
                    console.warn(`[useTimeConverter] Unknown TimeVariant encountered: ${exhaustiveCheck}`);
                    return datetime;
                }
            }

            // The locale primarily affects things like the AM/PM marker ('a')
            return dateTimeObj.setLocale(localeCode).toFormat(formatString);

        } catch (error) {
            console.error(`[useTimeConverter] Error formatting date "${datetime}" with variant "${variant}":`, error);
            return '';
        }
    };

    return { convertTime, timeUnit };
};
