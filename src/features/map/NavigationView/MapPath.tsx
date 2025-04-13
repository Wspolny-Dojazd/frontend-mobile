import Monicon from '@monicon/native';
import React, { Fragment, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Marker, Polyline } from 'react-native-maps';

import { components } from '@/src/api/openapi';
import { cn } from '@/src/lib/utils';

// import { MOCK_PATHS } from './mocks';

// type UserPath = (typeof MOCK_PATHS)[number]['paths'][number];
type ProposedPathDto = components['schemas']['ProposedPathDto'];
type PathData = ProposedPathDto['paths'][number];

type MapPathProps = {
  path: PathData;
  currentLatitudeDelta: number;
  muted: boolean;
};

const DELTA_THRESHOLD = 0.24;

export const MapPath = React.memo(({ path, currentLatitudeDelta, muted }: MapPathProps) => {
  const showDetailedStops = useMemo(
    () => currentLatitudeDelta < DELTA_THRESHOLD && !muted,
    [currentLatitudeDelta, muted]
  );

  console.log('update map path');

  return path.segments?.map((segment, index) => {
    const segmentKey = `${path.userId}-segment-${segment.line?.shortName ?? index}`;
    const segmentColor = `#${segment.line?.color ?? '000000'}`;
    const segmentColorMuted = `${segmentColor}44`;

    return (
      <Fragment key={segmentKey}>
        {showDetailedStops &&
          segment.stops?.map(
            (stop, stopIndex) =>
              stopIndex !== 0 && (
                <Marker
                  key={`${segmentKey}-stop-${stop.id}-${stopIndex}`}
                  coordinate={stop}
                  anchor={{ x: 0.5, y: 0.5 }}
                  style={{ zIndex: stopIndex === 0 ? 100 : 2 + stopIndex }}>
                  <View
                    className={cn(
                      'flex items-center justify-center rounded border border-gray-100 bg-white px-2 py-0.5 dark:border-gray-800 dark:bg-gray-900',
                      stopIndex === 0 && 'px-3'
                    )}>
                    <Text
                      className={cn(
                        'text-[0.5rem]',
                        stopIndex === 0 && 'text-sm font-bold text-black dark:text-white'
                      )}
                      style={{
                        ...(stopIndex !== 0 && { color: segmentColor }),
                      }}>
                      {stopIndex + 1}
                    </Text>
                  </View>
                </Marker>
              )
          )}

        {!muted && segment.type === 'Route' && (
          <Marker
            key={`${segmentKey}-marker`}
            coordinate={segment.stops![0]!}
            anchor={{ x: 0.5, y: 0.5 }}
            style={{ overflow: 'visible', zIndex: 100 }}>
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
