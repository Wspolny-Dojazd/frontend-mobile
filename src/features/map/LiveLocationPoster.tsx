import { useInterval } from '@mantine/hooks';
import { useEffect } from 'react';

import useLiveLocation from './useLiveLocation';

import { $api } from '@/src/api/api';
import { useAuth } from '@/src/context/authContext';

const useLocationPosting = () => {
  const { token, user } = useAuth();

  const { location } = useLiveLocation();
  const { mutate: postLocation } = $api.useMutation('post', '/api/users/me/location');

  const interval = useInterval(() => {
    if (location && token && user && user.id) {
      postLocation(
        {
          body: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            userId: user.id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        {
          onError(error, variables, context) {
            console.log('Error posting location', error);
          },
        }
      );
    }
  }, 10000);

  useEffect(() => {
    interval.start();
    return interval.stop;
  }, []);
};

export const LiveLocationPoster = () => {
  useLocationPosting();
  return null;
};
