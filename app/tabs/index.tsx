import { useState } from 'react';

import { NavigationView } from '@/src/features/map/NavigationView';
import { Coordinate, SearchLocationView } from '@/src/features/map/SearchLocationView';

export default function App() {
  const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | null>(null);

  return <NavigationView />;

  // return (
  //   <SearchLocationView
  //     selectedCoordinate={selectedCoordinate}
  //     setSelectedCoordinate={setSelectedCoordinate}
  //   />
  // );
}
