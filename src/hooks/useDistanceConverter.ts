import { $api } from "../api/api";
import { useAuth } from "../context/authContext";

export type FormattedDistance = `${number} km` | `${number} m` | `${number} ft` | `${number} mi`;

export const useDistanceConverter = () => {
    const { token } = useAuth();
    const { data } = $api.useQuery("get", "/api/user-configuration", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }, {
        enabled: !!token
    })

    const distanceUnit = data?.distanceUnit;
    // "Kilometers" | "Miles" | undefined

    const convertDistance = (distance_in_meter: number): FormattedDistance | number => {
        if (!distanceUnit) return distance_in_meter; // Return raw meters if no unit preference

        if (distanceUnit === "Kilometers") {
            if (distance_in_meter < 1000) {
                return `${distance_in_meter} m`;
            } else {
                const distance_in_km = distance_in_meter / 1000;
                return `${Number(distance_in_km.toFixed(1))} km`;
            }
        }

        if (distanceUnit === "Miles") {
            const meters_in_a_mile = 1609.34;
            if (distance_in_meter < meters_in_a_mile) {
                // Convert meters to feet for distances less than 1 mile
                const feet_in_a_meter = 3.28084;
                const distance_in_feet = Math.round(distance_in_meter * feet_in_a_meter);
                return `${distance_in_feet} ft`;
            } else {
                const distance_in_miles = distance_in_meter / meters_in_a_mile;
                return `${Number(distance_in_miles.toFixed(1))} mi`;
            }
        }

        // Fallback (shouldn't happen with current types, but good practice)
        return distance_in_meter;
    };

    return { convertDistance, distanceUnit };
};
