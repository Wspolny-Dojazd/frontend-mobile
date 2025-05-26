import React, { useCallback } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { $api } from '@/src/api/api';
import { components } from '@/src/api/openapi';
import { useAuth } from '@/src/context/authContext';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';
import { cn } from '@/src/lib/utils';

type ProposedPathDto = components['schemas']['ProposedPathDto'];
type PathData = ProposedPathDto['paths'][number];

const NAMESPACE = 'src/features/map/NavigationView';
const TRANSLATIONS = {
  en: {
    userId: 'User',
  },
  pl: {
    userId: 'Użytkownik',
  },
};

type UserPathOptionsProps = {
  usersPaths: PathData[];
  groupId: number;
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
};

export const UserPathOptions = ({
  usersPaths,
  groupId,
  selectedUserId,
  onSelectUser,
}: UserPathOptionsProps) => {
  const { token } = useAuth();

  const { data: members } = $api.useQuery(
    'get',
    '/api/groups/{id}/members',
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { path: { id: groupId } },
    },
    {
      enabled: !!token,
      refetchInterval: 5000, // Reduced from 1000ms to 5000ms to prevent flashing
      // select(data) {
      //   return useMemo(() => data, [JSON.stringify(data)]);
      // },
    }
  );

  const keyExtractor = useCallback((item: PathData) => item.userId, []);

  const renderUserPathSelectorItem = useCallback(
    ({ item }: { item: PathData & { nickname?: string } }) => {
      return (
        <UserPathSelectorItem
          path={item}
          isSelected={item.userId === selectedUserId}
          onSelect={onSelectUser}
        />
      );
    },
    [selectedUserId, onSelectUser]
  );

  const ItemSeparator = useCallback(() => <View className="w-3" />, []);

  if (!usersPaths || usersPaths.length === 0) {
    return null;
  }

  return (
    <FlatList<PathData & { nickname?: string }>
      horizontal
      data={usersPaths.map((path) => ({
        ...path,
        nickname: members?.find((member) => member.id === path.userId)?.nickname,
      }))}
      keyExtractor={keyExtractor}
      renderItem={renderUserPathSelectorItem}
      ItemSeparatorComponent={ItemSeparator}
      className="mt-4"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 2,
        flexGrow: 1,
        justifyContent: 'center',
      }}
      initialNumToRender={7}
      maxToRenderPerBatch={5}
      windowSize={11}
    />
  );
};

type UserPathSelectorItemProps = {
  path: PathData & { nickname?: string };
  isSelected: boolean;
  onSelect: (userId: string) => void;
};

const UserPathSelectorItem = React.memo(
  ({ path, isSelected, onSelect }: UserPathSelectorItemProps) => {
    const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
    const handlePress = useCallback(() => {
      onSelect(path.userId);
    }, [onSelect, path.userId]);

    const muted = !isSelected;

    return (
      <Pressable
        className={cn(
          'flex-row items-center justify-center rounded-xl px-4 py-2.5 shadow-sm',
          muted ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary shadow-md'
        )}
        onPress={handlePress}>
        <View className="flex-row items-center gap-2">
          <View
            className={cn(
              'h-2 w-2 rounded-full',
              muted ? 'bg-gray-400 dark:bg-gray-600' : 'bg-white'
            )}
          />
          <Text
            className={cn(
              'text-base font-semibold',
              muted ? 'text-gray-600 dark:text-gray-300' : 'text-white'
            )}>
            {path.nickname ?? `${t('userId')} ${path.userId.slice(0, 6)}`}
          </Text>
        </View>
      </Pressable>
    );
  }
);
UserPathSelectorItem.displayName = 'UserPathSelectorItem';
