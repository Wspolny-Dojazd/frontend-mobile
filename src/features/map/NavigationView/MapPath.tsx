import Monicon from '@monicon/native';
import { Text, View } from 'react-native';
import { Marker, Polyline } from 'react-native-maps';

import { MOCK_PATHS } from './mocks';

const COLORS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#000000'];
const MUTED_COLORS = COLORS.map((color) => `${color}66`);

type UserPath = (typeof MOCK_PATHS)[number]['paths'][number];

type MapPathProps = {
  path: UserPath;
  currentLatitudeDelta: number;
  muted: boolean;
};

export const MapPath = ({ path, currentLatitudeDelta, muted }: MapPathProps) => {
  const segments = path.segments;

  return segments?.map((segment, index) => {
    const stops = segment.stops?.map((stop, stopIndex) => {
      const isFirstStop = stopIndex === 0;
      const isLastStop = stopIndex === segment.stops?.length - 1;

      if (currentLatitudeDelta < 0.24) {
        return (
          <Marker
            key={`${path.userId}-${stop.id}-${stopIndex}`}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            style={{ overflow: 'visible', zIndex: 5 }}>
            <View className="flex items-center justify-center rounded border border-gray-800 bg-gray-900 px-2 py-0.5">
              <Text className="text-[0.5rem]" style={{ color: COLORS[index] }}>
                {stopIndex + 1}
              </Text>
            </View>
          </Marker>
        );
      }

      return <></>;
    });

    const stop1 = segment.stops?.[0];
    const stop2 = segment.stops?.[1];

    const avgCoordsBetweenStop1AndStop2 =
      stop1 && stop2
        ? {
            latitude: (stop1.latitude + stop2.latitude) / 2,
            longitude: (stop1.longitude + stop2.longitude) / 2,
          }
        : null;

    const segment_marker = (
      <Marker
        key={`${path.userId}-${segment.line?.shortName}-segment-${index}`}
        coordinate={{
          latitude: avgCoordsBetweenStop1AndStop2?.latitude ?? 0,
          longitude: avgCoordsBetweenStop1AndStop2?.longitude ?? 0,
        }}
        anchor={{ x: 0.5, y: 0.5 }}
        style={{ overflow: 'visible', zIndex: 10 }}>
        <View
          className="flex-row items-center justify-center gap-1 rounded border border-gray-800 px-1 py-0.5"
          style={{ backgroundColor: COLORS[index] }}>
          <Monicon name="ion:bus-outline" size={16} color="#FFF" />
          <Text className="text-sm font-bold text-white">401</Text>
        </View>
      </Marker>
    );

    const polyline = segment.shapes.map((shape, shapeIndex) => {
      return (
        <Polyline
          key={`${path.userId}-${segment.line?.shortName}-${index}-${shapeIndex}`}
          coordinates={shape.coords.map((coord) => ({
            latitude: coord.lat,
            longitude: coord.lon,
          }))}
          strokeWidth={3}
          strokeColor={muted ? MUTED_COLORS[index] : COLORS[index]}
          style={{ zIndex: 1 }}
        />
      );
    });

    return (
      <>
        {!muted && stops}
        {!muted && segment_marker}
        {polyline}
      </>
    );
  });
};
