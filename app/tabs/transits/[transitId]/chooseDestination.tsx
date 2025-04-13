import { useRouter } from 'expo-router';

import { useCoordinateContext } from './_layout';

import { Coordinate, SearchLocationView } from '@/src/features/map/SearchLocationView';

export default function ChooseDestination() {
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
    />
  );
}
