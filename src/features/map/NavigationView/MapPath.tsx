import Monicon from '@monicon/native';
import React, { useMemo } from 'react';
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
    segmentColor,
    stopIndex,
  }: {
    coordinate: any;
    segmentColor: string;
    stopIndex: number;
  }) => (
    <Marker
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
    coordinate,
    segmentColor,
    shortName,
    lineType,
  }: {
    coordinate: { latitude: number; longitude: number };
    segmentColor: string;
    shortName: string;
    lineType?: string;
  }) => {
    const iconMap = {
      Bus: 'ion:bus-outline',
      Metro: 'material-symbols:subway-outline',
      Tram: 'ph:tram-bold',
      Rail: 'maki:rail',
      Funicular: 'material-symbols:funicular-rounded',
      Ferry: 'fa6-solid:ferry',
      CableCar: 'ph:cable-car-fill',
      Trolleybus: 'mdi:bus-electric',
      Monorail: 'material-symbols:monorail-outline-rounded',
    };

    const icon = iconMap[lineType as keyof typeof iconMap] || 'ri:question-line';

    return (
      <Marker
        coordinate={coordinate}
        anchor={{ x: 0.5, y: 0.5 }}
        style={{ overflow: 'visible', zIndex: 100 }}
        tracksViewChanges={false}>
        <View
          className="flex-row items-center justify-center gap-1 rounded border border-gray-800 px-1 py-0.5"
          style={{ backgroundColor: segmentColor }}>
          <Monicon name={icon} size={16} color="#FFF" />
          <Text className="text-sm font-bold text-white">{shortName}</Text>
        </View>
      </Marker>
    );
  }
);

const PathShape = React.memo(
  ({
    coords,
    color,
    muted,
  }: {
    coords: PathData['segments'][number]['shapes'][number]['coords'];
    color: string;
    muted: boolean;
  }) => (
    <Polyline
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
    showDetailedStops,
    muted,
  }: {
    segment: PathData['segments'][number];
    showDetailedStops: boolean;
    muted: boolean;
  }) => {
    const segmentColor = useMemo(
      () => `#${segment.line?.color ?? '000000'}`,
      [segment.line?.color]
    );

    const firstStop = segment.stops?.[0];

    return (
      <>
        {showDetailedStops &&
          !muted &&
          segment.stops?.map(
            (stop: PathData['segments'][number]['stops'][number], stopIndex: number) =>
              stopIndex !== 0 && (
                <Stop
                  key={`stop-${stop.id}-${stopIndex}`}
                  coordinate={stop}
                  segmentColor={segmentColor}
                  stopIndex={stopIndex}
                />
              )
          )}

        {!muted && segment.type === 'Route' && segment.stops?.length && firstStop && (
          // TODO: If this is a walk segment then we should take average of two stops and show walk marker
          <RouteMarker
            coordinate={firstStop}
            segmentColor={segmentColor}
            shortName={segment.line?.shortName ?? '?'}
            lineType={segment.line?.type}
          />
        )}

        {segment.shapes.map(
          (shape: PathData['segments'][number]['shapes'][number], shapeIndex: number) => (
            <PathShape
              key={`shape-${shapeIndex}`}
              coords={shape.coords}
              color={segmentColor}
              muted={muted}
            />
          )
        )}
      </>
    );
  }
);

export const MapPath = React.memo(({ path, showDetailedStops, muted }: MapPathProps) => {
  const segments = path.segments ?? [];

  if (!segments.length) return null;

  const calculateKey = (segment: PathData['segments'][number]) =>
    `${segment.line?.shortName}-${segment.stops?.[0]?.id}-${segment.stops?.[segment.stops.length - 1]?.id}-${segment.shapes.length}-${segment.type}-${segment.from?.id}-${segment.to?.id}`;

  return (
    <>
      {segments.map((segment) => (
        <PathSegment
          key={calculateKey(segment)}
          segment={segment}
          showDetailedStops={showDetailedStops}
          muted={muted}
        />
      ))}
    </>
  );
});
