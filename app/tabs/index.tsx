import { useState } from 'react';

import { NavigationView } from '@/src/features/map/NavigationView';
import { Coordinate, SearchLocationView } from '@/src/features/map/SearchLocationView';
import { useAuth } from '@/src/context/authContext';
import { $api } from '@/src/api/api';

export default function App() {
  const { token } = useAuth();
  const queryGroups = $api.useQuery('get', '/api/groups', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | null>(null);

  if (queryGroups.data?.length && queryGroups.data.length > 0) {
    return <NavigationView />;
  }

  return (
    <SearchLocationView
      selectedCoordinate={selectedCoordinate}
      setSelectedCoordinate={setSelectedCoordinate}
    />
  );
}
