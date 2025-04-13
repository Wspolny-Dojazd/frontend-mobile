import Monicon from '@monicon/native';
import React, { Fragment, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Marker, Polyline } from 'react-native-maps';

import { MOCK_PATHS } from './mocks';

type UserPath = (typeof MOCK_PATHS)[number]['paths'][number];

type MapPathProps = {
  path: UserPath;
  currentLatitudeDelta: number;
  muted: boolean;
};

const DELTA_THRESHOLD = 0.24;

export const MapPath = React.memo(({ path, currentLatitudeDelta, muted }: MapPathProps) => {
  const showDetailedStops = useMemo(
    () => currentLatitudeDelta < DELTA_THRESHOLD && !muted,
    [currentLatitudeDelta, muted]
  );

  return path.segments?.map((segment, index) => {
    const segmentKey = `${path.userId}-segment-${segment.line?.shortName ?? index}`;
    const segmentColor = `#${segment.line?.color ?? '000000'}`;
    const segmentColorMuted = `${segmentColor}44`;

    const stop1 = segment.stops?.[0];
    const stop2 = segment.stops?.[1];
    let avgCoords = null;
    if (stop1 && stop2) {
      avgCoords = {
        latitude: (stop1.latitude + stop2.latitude) / 2,
        longitude: (stop1.longitude + stop2.longitude) / 2,
      };
    } else if (stop1) {
      avgCoords = { latitude: stop1.latitude, longitude: stop1.longitude };
    } else if (segment.shapes?.[0]?.coords?.[0]) {
      avgCoords = segment.shapes[0].coords[0];
    }

    return (
      <Fragment key={segmentKey}>
        {showDetailedStops &&
          segment.stops?.map((stop, stopIndex) => (
            <Marker
              key={`${segmentKey}-stop-${stop.id}-${stopIndex}`}
              coordinate={stop}
              anchor={{ x: 0.5, y: 0.5 }}
              style={{ zIndex: 5 }}>
              <View className="flex items-center justify-center rounded border border-gray-100 bg-white px-2 py-0.5 dark:border-gray-800 dark:bg-gray-900">
                <Text className="text-[0.5rem]" style={{ color: segmentColor }}>
                  {stopIndex + 1}
                </Text>
              </View>
            </Marker>
          ))}

        {!muted && avgCoords && segment.type === 'Route' && (
          <Marker
            key={`${segmentKey}-marker`}
            coordinate={avgCoords}
            anchor={{ x: 0.5, y: 0.5 }}
            style={{ overflow: 'visible', zIndex: 10 }}>
            <View
              className="flex-row items-center justify-center gap-1 rounded border border-gray-800 px-1 py-0.5"
              style={{ backgroundColor: segmentColor }}>
              <Monicon name="ion:bus-outline" size={16} color="#FFF" />
              <Text className="text-sm font-bold text-white">{segment.line?.shortName ?? '?'}</Text>
            </View>
          </Marker>
        )}

        {segment.shapes.map((shape, shapeIndex) => (
          <Polyline
            key={`${segmentKey}-shape-${shapeIndex}`}
            coordinates={shape.coords}
            strokeWidth={3}
            strokeColor={muted ? segmentColorMuted : segmentColor}
            style={{ zIndex: 1 }}
          />
        ))}
      </Fragment>
    );
  });
});

MapPath.displayName = 'MapPath';
