import { useState } from 'react';

import { Coordinate, SearchLocationView } from '@/src/features/map/SearchLocationView';

export default function ChooseDestination() {
  const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | null>(null);

  return (
    <SearchLocationView
      selectedCoordinate={selectedCoordinate}
      setSelectedCoordinate={setSelectedCoordinate}
      showBackButton
    />
  );
}
