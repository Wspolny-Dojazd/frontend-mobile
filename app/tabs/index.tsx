import { useState } from 'react';

import { $api } from '@/src/api/api';
import { useAuth } from '@/src/context/authContext';
import { NavigationView } from '@/src/features/map/NavigationView';
import { Coordinate, SearchLocationView } from '@/src/features/map/SearchLocationView';

export default function App() {
  const { token } = useAuth();
  const queryGroups = $api.useQuery('get', '/api/groups', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const currentGroup = queryGroups.data?.at(0);

  const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | null>(null);

  if (currentGroup) {
    return <NavigationView groupId={currentGroup.id} />;
  }

  return (
    <SearchLocationView
      selectedCoordinate={selectedCoordinate}
      setSelectedCoordinate={setSelectedCoordinate}
    />
  );
}
