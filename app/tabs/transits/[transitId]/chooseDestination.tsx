import { useRouter, useLocalSearchParams } from 'expo-router';

import { useCoordinateContext } from './_layout';

import { $api } from '@/src/api/api';
import { useAuth } from '@/src/context/authContext';
import { SearchLocationView } from '@/src/features/map/SearchLocationView';
import UserLocationMarker from '@/src/features/map/UserLocationMarker';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';

const NAMESPACE = 'app/tabs/transits/[transitId]/chooseDestination';
const TRANSLATIONS = {
  en: {
    acceptButtonText: 'Select',
  },
  pl: {
    acceptButtonText: 'Wybierz',
  },
};

export default function ChooseDestination() {
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
  const { destinationCoordinate, setDestinationCoordinate } = useCoordinateContext();
  const router = useRouter();

  const handleCoordinateSelection = () => {
    if (destinationCoordinate) {
      router.back();
    }
  };

  const { transitId } = useLocalSearchParams<{ transitId: string }>();
  const { token } = useAuth();

  const { data: members } = $api.useQuery('get', '/api/groups/{id}/members', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      path: { id: Number(transitId) },
    },
  });

  const UserLocationMarkers = () => {
    return members?.map(
      (member) =>
        member.location && (
          <UserLocationMarker
            key={member.id}
            latitude={member.location.latitude}
            longitude={member.location.longitude}
            userName={member.username}
            isSelected={false}
          />
        )
    );
  };

  return (
    <SearchLocationView
      selectedCoordinate={destinationCoordinate}
      setSelectedCoordinate={setDestinationCoordinate}
      showBackButton
      onAccept={handleCoordinateSelection}
      acceptButtonText={t('acceptButtonText')}
      mapComponents={<UserLocationMarkers />}
    />
  );
}
