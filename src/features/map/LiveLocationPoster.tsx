import { useInterval } from '@mantine/hooks';
import { useEffect } from 'react';

import useLiveLocation from './useLiveLocation';

import { $api } from '@/src/api/api';
import { useAuth } from '@/src/context/authContext';

const useLocationPosting = () => {
  const { token } = useAuth();
  const { data: user } = $api.useQuery(
    'get',
    '/api/auth/me',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      enabled: !!token,
    }
  );

  const { location } = useLiveLocation();
  const mutationPostLocation = $api.useMutation('post', '/api/users/me/location');

  const interval = useInterval(() => {
    if (location && token && user && user.id) {
      mutationPostLocation.mutate(
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
          // onSuccess(data, variables, context) {
          //   console.log('Location posted successfully', data.latitude, data.longitude);
          // },
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
  return <></>;
};
