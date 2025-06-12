import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Monicon from '@monicon/native';
import React, { useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { components } from '@/src/api/openapi';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/src/components/ui/collapsible';
import { useDistanceConverter } from '@/src/hooks/useDistanceConverter';
import { ChevronDown } from '@/src/lib/icons/ChevronDown';
import { ChevronRight } from '@/src/lib/icons/ChevronRight';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';
import { useTheme } from '@/src/lib/useTheme';
import { cn } from '@/src/lib/utils';

type ProposedPathDto = components['schemas']['ProposedPathDto'];
type PathData = ProposedPathDto['paths'][number];

const NAMESPACE = 'src/features/map/NavigationView/NavigationBottomSheet';
const TRANSLATIONS = {
  en: {
    selectedPlace: 'Selected Place',
    newRide: 'New Ride',
    meters: 'm',
    walk: 'Walk',
    stop: 'stop',
    stops: 'stops',
    onTime: 'On time',
    delayed: 'Delayed',
    joinRideWith: 'Join ride with',
    getOffAt: 'Get off at',
  },
  pl: {
    selectedPlace: 'Wybrane miejsce',
    newRide: 'Nowy Przejazd',
    meters: 'm',
    walk: 'Pieszo',
    stop: 'przystanek',
    stops2to4: 'przystanki',
    stops5plus: 'przystanków',
    onTime: 'Zgodnie z rozkładem',
    delayed: 'Opóźnienie',
    joinRideWith: 'Dołączasz do przejazdu z',
    getOffAt: 'Wysiądź na',
  },
};

// Helper function to get pluralized stops text using translation system
const getPluralizedStops = (
  count: number,
  t: (key: string) => string,
  language: string
): string => {
  if (language === 'pl') {
    if (count === 1) {
      return t('stop');
    } else {
      // Polish pluralization rules:
      // - Numbers ending in 2, 3, 4 (except 12, 13, 14) use "przystanki"
      // - All other numbers use "przystanków"
      const lastDigit = count % 10;
      const lastTwoDigits = count % 100;

      if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
        return t('stops2to4');
      } else {
        return t('stops5plus');
      }
    }
  } else {
    // English
    return count === 1 ? t('stop') : t('stops');
  }
};

const Divider = ({ className }: { className?: string }) => {
  return <View className={cn('h-0.5 w-full bg-gray-200 dark:bg-gray-600', className)} />;
};

const CustomHandle = () => {
  return (
    <View className="items-center py-2.5">
      <View className="h-1 w-16 rounded-full bg-border" />
    </View>
  );
};

type TopBarItemProps = {
  type:
    | 'walk'
    | 'bus'
    | 'metro'
    | 'tram'
    | 'rail'
    | 'funicular'
    | 'ferry'
    | 'cablecar'
    | 'trolleybus'
    | 'monorail';
  label?: string;
  color?: string;
};

const TopBarItem = ({ type, label, color }: TopBarItemProps) => {
  const theme = useTheme();

  const iconMap = {
    bus: 'ion:bus-outline',
    metro: 'material-symbols:subway-outline',
    tram: 'ph:tram-bold',
    walk: 'bx:walk',
    rail: 'maki:rail',
    funicular: 'material-symbols:funicular-rounded',
    ferry: 'fa6-solid:ferry',
    cablecar: 'ph:cable-car-fill',
    trolleybus: 'mdi:bus-electric',
    monorail: 'material-symbols:monorail-outline-rounded',
  };
  const icon = iconMap[type] || 'ri:question-line';

  return (
    <View className="flex-row items-center gap-1">
      <Monicon name={icon} size={24} color={theme.text} />
      {label && (
        <View className="rounded-lg px-3 py-1" style={{ backgroundColor: `#${color}` }}>
          <Text className="font-bold text-white">{label}</Text>
        </View>
      )}
    </View>
  );
};

type TopBarProps = {
  items: TopBarItemProps[];
  className?: string;
};

const TopBar = ({ items, className }: TopBarProps) => {
  return (
    <View className={cn('flex-row flex-wrap items-center justify-center gap-1', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <TopBarItem {...item} />
          {index < items.length - 1 && <ChevronRight className="h-4 w-4 text-foreground" />}
        </React.Fragment>
      ))}
    </View>
  );
};

type TransitPartStartProps = {
  label: string;
};

const TransitPartStart = ({ label }: TransitPartStartProps) => {
  return (
    <View className="flex-row items-center justify-start gap-4 px-4">
      <View className="w-10 flex-col items-center justify-center">
        <View className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary">
          <View className="h-4 w-4 rounded-full bg-primary" />
        </View>
      </View>

      <View className="flex-col">
        <Text className="text-foreground">{label}</Text>
      </View>
    </View>
  );
};

type TransitPartStopProps = {
  label: string;
};

const TransitPartStop = ({ label }: TransitPartStopProps) => {
  const theme = useTheme();

  return (
    <View className="mt-1 flex-row items-center justify-start gap-4 px-4">
      <View className="w-10 flex-col items-center justify-center">
        <Monicon name="majesticons:map-marker" size={24} color={theme.primary} />
      </View>

      <View className="flex-col">
        <Text className="text-foreground">{label}</Text>
      </View>
    </View>
  );
};

type TransitPartWalkProps = {
  estimatedTime: number;
  distance: number;
};

const TransitPartWalk = ({ estimatedTime, distance }: TransitPartWalkProps) => {
  const theme = useTheme();
  const { convertDistance } = useDistanceConverter();
  const distanceText = convertDistance(distance);
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);

  return (
    <View className="mt-1 flex-row items-stretch justify-start gap-4 px-4">
      <View className="w-10 flex-col items-center justify-center gap-1">
        <View className="flex h-1.5 w-1.5 items-center justify-center rounded-full border-2 border-gray-500 dark:border-gray-400" />
        <View className="flex h-1.5 w-1.5 items-center justify-center rounded-full border-2 border-gray-500 dark:border-gray-400" />

        <View className="my-1">
          <Monicon name="bx:walk" size={28} color={theme.text} />
        </View>

        <View className="flex h-1.5 w-1.5 items-center justify-center rounded-full border-2 border-gray-500 dark:border-gray-400" />
        <View className="flex h-1.5 w-1.5 items-center justify-center rounded-full border-2 border-gray-500 dark:border-gray-400" />
      </View>

      <View className="flex-1 flex-col items-start justify-between">
        <Divider />

        <Text className="text-foreground">
          {t('walk')} {estimatedTime} min ({distanceText})
        </Text>

        <Divider />
      </View>
    </View>
  );
};

type TransitPartVehicleProps = {
  vehicleType:
    | 'Bus'
    | 'Tram'
    | 'Metro'
    | 'Rail'
    | 'Funicular'
    | 'Ferry'
    | 'CableCar'
    | 'Trolleybus'
    | 'Monorail';

  startStop: string;
  endStop: string;
  lineNumber: string;
  lineName: string;

  scheduledTimeOfDeparture: string;

  stops: components['schemas']['StopDto'][];
  color: string;
};

const TransitPartVehicle = ({
  vehicleType,
  startStop,
  endStop,
  lineNumber,
  lineName,
  scheduledTimeOfDeparture,

  stops,

  color,
}: TransitPartVehicleProps) => {
  const theme = useTheme();
  const { t, i18n } = useInlineTranslations(NAMESPACE, TRANSLATIONS);

  const [open, setOpen] = useState(false);

  const iconMap = {
    bus: 'ion:bus-outline',
    metro: 'material-symbols:subway-outline',
    tram: 'ph:tram-bold',
    walk: 'bx:walk',
    rail: 'maki:rail',
    funicular: 'material-symbols:funicular-rounded',
    ferry: 'fa6-solid:ferry',
    cablecar: 'ph:cable-car-fill',
    trolleybus: 'mdi:bus-electric',
    monorail: 'material-symbols:monorail-outline-rounded',
  };
  const icon = iconMap[vehicleType.toLowerCase() as keyof typeof iconMap] || 'ri:question-line';

  return (
    <View className="mt-1 flex-row items-start justify-start gap-4 px-4">
      <View className="relative w-10 flex-col items-center justify-start gap-1">
        <View className="absolute left-1/2 top-0 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
          <Monicon name={icon} size={24} color={theme.text} />
        </View>
        <View
          className="flex w-3 flex-1 items-center justify-end rounded-full"
          style={{ backgroundColor: `#${color}`, borderRadius: 100 }}>
          <View className="mb-0.5 h-2 w-2 rounded-full bg-white" />
        </View>
      </View>

      <View className="flex-1 flex-col">
        <View className="h-10 flex-col items-start justify-center">
          <Text className="text-lg font-bold text-foreground">
            {startStop} ({stops?.[0]?.code})
          </Text>
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <View className="rounded-lg px-3 py-1" style={{ backgroundColor: `#${color}` }}>
            <Text className="font-bold text-white">{lineNumber}</Text>
          </View>
          <Text className="mr-auto text-foreground">
            {lineName.length > 28 ? `${lineName.substring(0, 28)}...` : lineName}
          </Text>
          <Text className="font-semibold text-foreground">
            {new Date(scheduledTimeOfDeparture).toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* <View className="mt-1 flex-row items-center justify-start gap-3">
          <Text className="mr-auto text-primary">{t('onTime')}</Text>
        </View> */}

        <Divider className="my-2" />

        <Collapsible
          key={`collapsible-${startStop}-${lineNumber}`}
          open={open}
          onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex-row items-center justify-start gap-3">
            <ChevronDown className="text-foreground" />
            <Text className="text-foreground">
              {stops.length} {getPluralizedStops(stops.length, t, i18n.language)}
            </Text>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <View className="flex-1 flex-col items-start justify-start gap-2">
              {stops.map((stop, index) => (
                <View key={index} className="flex w-full flex-row items-center justify-start gap-2">
                  <Text className="text-sm text-muted-foreground">{`${index + 1}.`}</Text>
                  <Text className="text-foreground">{`${stop.name} (${stop.code})`}</Text>
                  <Text className="ml-auto text-sm text-muted-foreground">
                    {stop.departureTime
                      ? new Date(stop.departureTime).toLocaleTimeString('pl-PL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : stop.arrivalTime &&
                        new Date(stop.arrivalTime).toLocaleTimeString('pl-PL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                  </Text>
                </View>
              ))}
            </View>
          </CollapsibleContent>
        </Collapsible>

        <Divider className="my-2" />

        <View className="h-10 flex-col items-start justify-center">
          <Text className="text-lg font-bold text-foreground">
            {endStop} ({stops?.[stops.length - 1]?.code})
          </Text>
        </View>
      </View>
    </View>
  );
};

type NavigationBottomSheetProps = {
  path: PathData;
};

export const NavigationBottomSheet = React.memo(({ path }: NavigationBottomSheetProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['10%', '40%', '80%', '100%'], []);
  const theme = useTheme();

  const memoizedGuidelines = useMemo(() => {
    const segments = path?.segments;
    if (!segments) return [];

    const parts =
      segments?.map((segment, index) => {
        if (segment.type === 'Walk') {
          const key = `walk-${segment.from?.id ?? index}`;
          return (
            <TransitPartWalk
              key={key}
              // @ts-expect-error
              estimatedTime={segment.duration}
              // @ts-expect-error
              distance={segment.distance}
            />
          );
        } else if (segment.type === 'Route') {
          const key = `vehicle-${segment.line?.type}-${segment.line?.shortName ?? index}`;

          const startStopName = segment.stops?.[0]?.name ?? '';
          const endStopName = segment.stops?.[segment.stops.length - 1]?.name ?? '';

          return (
            <TransitPartVehicle
              key={key}
              vehicleType={segment.line?.type as 'Bus' | 'Metro' | 'Tram'}
              startStop={startStopName}
              endStop={endStopName}
              lineNumber={segment.line?.shortName ?? ''}
              lineName={segment.line?.longName ?? ''}
              scheduledTimeOfDeparture={segment.stops?.[0]?.departureTime ?? ''}
              stops={segment.stops}
              color={segment.line?.color ?? ''}
            />
          );
        }
        return null;
      }) ?? [];

    const start = () => {
      if (segments?.[0]?.type === 'Walk') {
        const key = `start-${segments[0]?.stops?.[0]?.id ?? 'start'}`;
        return <TransitPartStart key={key} label={segments[0]?.stops?.[0]?.name ?? ''} />;
      }
      return null;
    };

    const end = () => {
      const lastSegment = segments?.[segments.length - 1];
      if (lastSegment?.type === 'Walk') {
        const lastStopIndex = (lastSegment.stops?.length ?? 1) - 1;
        const lastStop = lastSegment.stops?.[lastStopIndex];
        const key = `end-${lastStop?.id ?? 'end'}`;
        return <TransitPartStop key={key} label={lastStop?.name ?? ''} />;
      }
      return null;
    };

    return [start(), ...parts, end()].filter(Boolean);
  }, [path]);

  const memoizedSummaryItems = useMemo(() => {
    console.log('Recalculating summary items');
    return (
      path?.segments?.map((segment) => {
        const type = segment.type === 'Walk' ? 'walk' : segment.line?.type.toLowerCase();

        return {
          type: type as
            | 'walk'
            | 'bus'
            | 'metro'
            | 'tram'
            | 'rail'
            | 'funicular'
            | 'ferry'
            | 'cablecar'
            | 'monorail',
          label: segment.line?.shortName,
          color: segment.line?.color,
        };
      }) ?? []
    );
  }, [path]);

  const backgroundStyle = useMemo(
    () => ({
      backgroundColor: theme.background,
    }),
    [theme.background]
  );

  const sheetStyle = useMemo(
    () => ({
      borderWidth: 1,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderColor: theme.border,
    }),
    [theme.border]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={0}
      handleComponent={CustomHandle}
      backgroundStyle={backgroundStyle}
      style={sheetStyle}>
      <BottomSheetScrollView>
        <TopBar className="mx-auto mt-4" items={memoizedSummaryItems} />

        <View className="my-4">{memoizedGuidelines}</View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

NavigationBottomSheet.displayName = 'NavigationBottomSheet';
