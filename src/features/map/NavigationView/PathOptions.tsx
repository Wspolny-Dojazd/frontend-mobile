import { Monicon } from '@monicon/native';
import React, { useCallback } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { components } from '@/src/api/openapi';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';
import { useTheme } from '@/src/lib/useTheme';
import { cn } from '@/src/lib/utils';

type ProposedPathDto = components['schemas']['ProposedPathDto'];

const NAMESPACE = 'src/features/map/PathOptions';
const TRANSLATIONS = {
  en: {
    path: 'Path',
  },
  pl: {
    path: 'Trasa',
  },
};

type PathOptionsProps = {
  proposedPaths: ProposedPathDto[];
  selectedPathId: string | null;
  onSelectPath: (pathId: string) => void;
};

export const PathOptions = ({ proposedPaths, selectedPathId, onSelectPath }: PathOptionsProps) => {
  const pathOptionKeyExtractor = useCallback((item: ProposedPathDto) => item.id, []);

  const renderPathOptionItem = useCallback(
    ({ item, index }: { item: ProposedPathDto; index: number }) => {
      return (
        <PathOptionSelectorItem
          pathOption={item}
          pathIndex={index}
          isSelected={item.id === selectedPathId}
          onSelect={onSelectPath}
        />
      );
    },
    [selectedPathId, onSelectPath]
  );

  const ItemSeparator = useCallback(() => <View className="w-3" />, []);

  if (proposedPaths.length === 0) {
    return null;
  }

  return (
    <FlatList<ProposedPathDto>
      horizontal
      data={proposedPaths}
      keyExtractor={pathOptionKeyExtractor}
      renderItem={renderPathOptionItem}
      ItemSeparatorComponent={ItemSeparator}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 2,
        flexGrow: 1,
        justifyContent: 'center',
      }}
      initialNumToRender={5}
      maxToRenderPerBatch={3}
      windowSize={9}
    />
  );
};

type PathOptionSelectorItemProps = {
  pathOption: ProposedPathDto;
  pathIndex: number;
  isSelected: boolean;
  onSelect: (pathId: string) => void;
};

const PathOptionSelectorItem = React.memo(
  ({ pathOption, pathIndex, isSelected, onSelect }: PathOptionSelectorItemProps) => {
    const theme = useTheme();
    const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
    const handlePress = useCallback(() => {
      onSelect(pathOption.id);
    }, [onSelect, pathOption.id]);

    return (
      <Pressable
        className={cn(
          'flex-row items-center justify-center rounded-xl px-4 py-2.5 shadow-sm',
          isSelected ? 'bg-primary shadow-md' : 'bg-gray-100 dark:bg-gray-800'
        )}
        onPress={handlePress}>
        <View className="flex-row items-center gap-2">
          <Monicon
            name="tabler:route-alt-left"
            size={16}
            color={isSelected ? 'white' : theme.border}
          />
          <Text
            className={cn(
              'text-base font-semibold',
              isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'
            )}>
            {t('path')} {pathIndex + 1}
          </Text>
        </View>
      </Pressable>
    );
  }
);
PathOptionSelectorItem.displayName = 'PathOptionSelectorItem';
