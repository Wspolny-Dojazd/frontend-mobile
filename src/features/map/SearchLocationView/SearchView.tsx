import { View, Text, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Place } from './LocationBottomSheet';

import { Input } from '@/src/components/ui/input';
import { ChevronLeft } from '@/src/lib/icons/ChevronLeft';
import { MapPin } from '@/src/lib/icons/MapPin';
import { useInlineTranslations } from '@/src/lib/useInlineTranslations';
import { useTheme } from '@/src/lib/useTheme';

const NAMESPACE = 'src/features/map/SearchView';
const TRANSLATIONS = {
  en: {
    searchPlaceholder: 'Where are you going...',
    kilometers: 'km',
  },
  pl: {
    searchPlaceholder: 'Gdzie się wybierasz...',
    kilometers: 'km',
  },
};

type SearchViewProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPlaces: Place[];
  onClose: () => void;
  onPlaceSelect: (place: Place) => void;
};

export const SearchView = ({
  searchQuery,
  setSearchQuery,
  filteredPlaces,
  onClose,
  onPlaceSelect,
}: SearchViewProps) => {
  const { t } = useInlineTranslations(NAMESPACE, TRANSLATIONS);
  const theme = useTheme();
  return (
    <SafeAreaView className="flex-1">
      <View className="mt-2 flex-1 flex-col items-start justify-start">
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('searchPlaceholder')}
          containerClassName="bg-gray-50 dark:bg-gray-900 border-0 mx-3"
          leftSection={
            <Pressable onPress={onClose}>
              <ChevronLeft size={20} color={theme.text} />
            </Pressable>
          }
        />

        <FlatList
          data={filteredPlaces}
          style={{ width: '100%' }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onPlaceSelect(item)}
              className="mx-4 my-4 flex flex-row items-center justify-start gap-2">
              <MapPin size={20} className="text-primary" />
              <View className="flex flex-col items-start justify-start">
                <View className="flex flex-row items-center justify-start gap-2">
                  <Text className="text-wrap pt-1 text-lg font-bold dark:text-white">
                    {item.name}{' '}
                    <Text className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {item.distance} {t('kilometers')}
                    </Text>
                  </Text>
                </View>
                <Text className="text-sm text-gray-500 dark:text-gray-400">{item.address}</Text>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => (
            <View className="h-[1px] w-full bg-gray-200 dark:bg-gray-700" />
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </SafeAreaView>
  );
};
