import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Monicon from '@monicon/native';
import React, { useMemo, useRef } from 'react';
import { Text, View } from 'react-native';

import { MOCK_PATHS } from './mocks';

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/src/components/ui/collapsible';
import { ChevronDown } from '@/src/lib/icons/ChevronDown';
import { ChevronRight } from '@/src/lib/icons/ChevronRight';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';
import { useTheme } from '@/src/lib/useTheme';
import { cn } from '@/src/lib/utils';

type UserPath = (typeof MOCK_PATHS)[number]['paths'][number];

const NAMESPACE = 'src/features/map/NavigationView/NavigationBottomSheet';
const TRANSLATIONS = {
  en: {
    selectedPlace: 'Selected Place',
    newRide: 'New Ride',
    meters: 'm',
    walk: 'Walk',
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
    stops: 'przystanki',
    onTime: 'Zgodnie z rozkładem',
    delayed: 'Opóźnienie',
    joinRideWith: 'Dołączasz do przejazdu z',
    getOffAt: 'Wysiądź na',
  },
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
  type: 'walk' | 'bus' | 'subway' | 'tram';
  label?: string;
  color?: string;
};

const TopBarItem = ({ type, label, color }: TopBarItemProps) => {
  const theme = useTheme();

  const iconMap = {
    bus: 'ion:bus-outline',
    subway: 'ic:outline-subway',
    tram: 'ic:outline-tram',
    walk: 'bx:walk',
  };
  const icon = iconMap[type];

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
    <View className={cn('flex flex-row items-center', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <TopBarItem {...item} />
          {index < items.length - 1 && <ChevronRight className="text-foreground" />}
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
          {t('walk')} {estimatedTime} min ({distance} {t('meters')})
        </Text>

        <Divider />
      </View>
    </View>
  );
};

type TransitPartVehicleProps = {
  vehicleType: 'Bus' | 'Subway' | 'Tram';

  startStop: string;
  endStop: string;
  lineNumber: string;
  lineName: string;

  scheduledTimeOfDeparture: string;

  stops: string[];
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
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);

  const iconMap = {
    Bus: 'ion:bus-outline',
    Subway: 'ic:outline-subway',
    Tram: 'ph:tram',
  };
  const icon = iconMap[vehicleType];

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
          <Text className="text-lg font-bold text-foreground">{startStop}</Text>
        </View>

        <View className="flex-row items-center justify-start gap-3">
          <View className="rounded-lg px-3 py-1" style={{ backgroundColor: `#${color}` }}>
            <Text className="font-bold text-white">{lineNumber}</Text>
          </View>
          <Text className="mr-auto text-foreground">{lineName}</Text>
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

        <Collapsible>
          <CollapsibleTrigger className="flex-row items-center justify-start gap-3">
            <ChevronDown className="text-foreground" />
            <Text className="text-foreground">
              {stops.length} {t('stops')}
            </Text>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <View className="ml-10 flex-col items-start justify-start gap-2">
              {stops.map((stop, index) => (
                <Text key={index} className="text-foreground">
                  {stop}
                </Text>
              ))}
            </View>
          </CollapsibleContent>
        </Collapsible>

        <Divider className="my-2" />

        <View className="h-10 flex-col items-start justify-center">
          <Text className="text-lg font-bold text-foreground">{endStop}</Text>
        </View>
      </View>
    </View>
  );
};

type NavigationBottomSheetProps = {
  path: UserPath;
};

export const NavigationBottomSheet = React.memo(({ path }: NavigationBottomSheetProps) => {
  console.log('NavigationBottomSheet render');

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
          return <TransitPartWalk key={key} estimatedTime={-1} distance={-1} />;
        } else if (segment.type === 'Route') {
          const key = `vehicle-${segment.line?.type}-${segment.line?.shortName ?? index}`;

          const startStopName = segment.stops?.[0]?.name ?? '';
          const endStopName = segment.stops?.[segment.stops.length - 1]?.name ?? '';
          const stopNames = segment.stops?.map((stop) => stop.name ?? '') ?? [];

          return (
            <TransitPartVehicle
              key={key}
              vehicleType={segment.line?.type as 'Bus' | 'Subway' | 'Tram'}
              startStop={startStopName}
              endStop={endStopName}
              lineNumber={segment.line?.shortName ?? ''}
              lineName={segment.line?.longName ?? ''}
              scheduledTimeOfDeparture={segment.stops?.[0]?.departureTime ?? ''}
              stops={stopNames}
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
          type: type as 'walk' | 'bus' | 'subway' | 'tram',
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
