import Monicon from '@monicon/native';
import React, { Fragment, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Marker, Polyline } from 'react-native-maps';

import { components } from '@/src/api/openapi';
import { cn } from '@/src/lib/utils';

type ProposedPathDto = components['schemas']['ProposedPathDto'];
type PathData = ProposedPathDto['paths'][number];

type MapPathProps = {
  path: PathData;
  showDetailedStops: boolean;
  muted: boolean;
};

const Stop = React.memo(
  ({
    coordinate,
    segmentKey,
    stop,
    segmentColor,
    stopIndex,
  }: {
    coordinate: any;
    segmentKey: string;
    stop: any;
    segmentColor: string;
    stopIndex: number;
  }) => (
    <Marker
      key={`${segmentKey}-stop-${stop.id}-${stopIndex}`}
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      style={{ zIndex: stopIndex === 0 ? 100 : 2 + stopIndex }}
      tracksViewChanges={false}>
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
          style={stopIndex !== 0 ? { color: segmentColor } : undefined}>
          {stopIndex + 1}
        </Text>
      </View>
    </Marker>
  )
);

const RouteMarker = React.memo(
  ({
    segmentKey,
    coordinate,
    segmentColor,
    shortName,
  }: {
    segmentKey: string;
    coordinate: any;
    segmentColor: string;
    shortName: string;
  }) => (
    <Marker
      key={`${segmentKey}-marker`}
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      style={{ overflow: 'visible', zIndex: 100 }}
      tracksViewChanges={false}>
      <View
        className="flex-row items-center justify-center gap-1 rounded border border-gray-800 px-1 py-0.5"
        style={{ backgroundColor: segmentColor }}>
        <Monicon name="ion:bus-outline" size={16} color="#FFF" />
        <Text className="text-sm font-bold text-white">{shortName}</Text>
      </View>
    </Marker>
  )
);

const PathShape = React.memo(
  ({
    segmentKey,
    shapeIndex,
    coords,
    color,
    muted,
  }: {
    segmentKey: string;
    shapeIndex: number;
    coords: any[];
    color: string;
    muted: boolean;
  }) => (
    <Polyline
      key={`${segmentKey}-shape-${shapeIndex}`}
      coordinates={coords}
      strokeWidth={3}
      strokeColor={muted ? `${color}44` : color}
      style={{ zIndex: 1 }}
    />
  )
);

const PathSegment = React.memo(
  ({
    segment,
    index,
    pathUserId,
    showDetailedStops,
    muted,
  }: {
    segment: any;
    index: number;
    pathUserId: string;
    showDetailedStops: boolean;
    muted: boolean;
  }) => {
    const segmentKey = useMemo(
      () => `${pathUserId}-segment-${segment.line?.shortName ?? index}`,
      [pathUserId, segment.line?.shortName, index]
    );

    const segmentColor = useMemo(
      () => `#${segment.line?.color ?? '000000'}`,
      [segment.line?.color]
    );

    return (
      <Fragment key={segmentKey}>
        {showDetailedStops &&
          !muted &&
          segment.stops?.map(
            (stop: any, stopIndex: number) =>
              stopIndex !== 0 && (
                <Stop
                  key={`${segmentKey}-stop-${stop.id}-${stopIndex}`}
                  coordinate={stop}
                  segmentKey={segmentKey}
                  stop={stop}
                  segmentColor={segmentColor}
                  stopIndex={stopIndex}
                />
              )
          )}

        {!muted && segment.type === 'Route' && segment.stops?.length && (
          <RouteMarker
            segmentKey={segmentKey}
            coordinate={segment.stops[0]}
            segmentColor={segmentColor}
            shortName={segment.line?.shortName ?? '?'}
          />
        )}

        {segment.shapes.map((shape: any, shapeIndex: number) => (
          <PathShape
            key={`${segmentKey}-shape-${shapeIndex}`}
            segmentKey={segmentKey}
            shapeIndex={shapeIndex}
            coords={shape.coords}
            color={segmentColor}
            muted={muted}
          />
        ))}
      </Fragment>
    );
  }
);

export const MapPath = React.memo(({ path, showDetailedStops, muted }: MapPathProps) => {
  const segments = useMemo(() => {
    return path.segments || [];
  }, [path.segments]);

  if (!segments.length) return null;

  return (
    <>
      {segments.map((segment, index) => (
        <PathSegment
          key={`${path.userId}-segment-${segment.line?.shortName ?? index}`}
          segment={segment}
          index={index}
          pathUserId={path.userId}
          showDetailedStops={showDetailedStops}
          muted={muted}
        />
      ))}
    </>
  );
});

MapPath.displayName = 'MapPath';
