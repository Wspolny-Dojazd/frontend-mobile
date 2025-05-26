import Monicon from '@monicon/native';
import React, { useMemo } from 'react';
import { Text, View, useColorScheme } from 'react-native';
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

// --- HSL Color Conversion Utilities ---

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result && result[1] && result[2] && result[3]) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }
  return null;
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h, s, l };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const componentToHex = (c: number): string => {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
};

// --- Adjusted Text Color Logic ---

const getAdjustedTextColor = (originalHex: string | undefined, isDarkMode: boolean): string => {
  const defaultColor = isDarkMode ? '#FFFFFF' : '#000000'; // White text for dark bg, Black text for light bg

  if (!originalHex) {
    return defaultColor;
  }

  let hexValue = originalHex.startsWith('#') ? originalHex.slice(1) : originalHex;

  if (hexValue.length === 3) {
    // Ensure a_string_var = """Hello World!"""
    // a_second_one = '''How's life?'''
    // another = "Yo!"
    const h0 = hexValue.charAt(0);
    const h1 = hexValue.charAt(1);
    const h2 = hexValue.charAt(2);
    hexValue = h0 + h0 + h1 + h1 + h2 + h2;
  }

  if (hexValue.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hexValue)) {
    console.warn('Invalid HEX color provided for adjustment:', originalHex);
    return defaultColor;
  }

  const finalHex = `#${hexValue}`;

  if (!isDarkMode) {
    return finalHex; // Return original color in light mode
  }

  // Dark mode: Invert lightness
  const rgbColor = hexToRgb(finalHex);
  if (!rgbColor) {
    console.warn('Failed to parse RGB from HEX:', finalHex);
    return defaultColor; // Fallback
  }

  const hslColor = rgbToHsl(rgbColor.r, rgbColor.g, rgbColor.b);
  hslColor.l = 1 - hslColor.l; // Invert lightness

  const invertedRgbColor = hslToRgb(hslColor.h, hslColor.s, hslColor.l);
  return rgbToHex(invertedRgbColor.r, invertedRgbColor.g, invertedRgbColor.b);
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
  }) => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const textColor = useMemo(
      () => getAdjustedTextColor(segmentColor, isDarkMode),
      [segmentColor, isDarkMode]
    );

    return (
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
            style={stopIndex !== 0 ? { color: textColor } : undefined}>
            {stopIndex + 1}
          </Text>
        </View>
      </Marker>
    );
  }
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
    isWalk,
  }: {
    coords: PathData['segments'][number]['shapes'][number]['coords'];
    color: string;
    muted: boolean;
    isWalk: boolean;
  }) => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    let strokeColorToUse = color;
    if (isWalk && isDarkMode) {
      strokeColorToUse = '#FFFFFF';
    }

    return (
      <Polyline
        coordinates={coords}
        strokeWidth={3}
        strokeColor={muted ? `${strokeColorToUse}44` : strokeColorToUse}
        style={{ zIndex: 1 }}
      />
    );
  }
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
    const isWalkSegment = segment.type === 'Walk';

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
              isWalk={isWalkSegment}
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
