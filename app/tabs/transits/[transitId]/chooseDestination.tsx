import { useRouter } from 'expo-router';

import { useCoordinateContext } from './_layout';

import { SearchLocationView } from '@/src/features/map/SearchLocationView';
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

  return (
    <SearchLocationView
      selectedCoordinate={destinationCoordinate}
      setSelectedCoordinate={setDestinationCoordinate}
      showBackButton
      onAccept={handleCoordinateSelection}
      acceptButtonText={t('acceptButtonText')}
    />
  );
}
