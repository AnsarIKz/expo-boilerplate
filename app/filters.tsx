import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { FilterSection } from "@/components/ui/FilterSection";
import { Typography } from "@/components/ui/Typography";
import {
  useCuisineTypes,
  useRestaurantFeatures,
} from "@/hooks/api/useRestaurantsApi";
import { useFiltersContext } from "@/providers/FiltersProvider";

export default function FiltersScreen() {
  const {
    filters,
    togglePriceCategory,
    toggleCuisine,
    toggleFeature,
    toggleTag,
    clearAllFilters,
    getActiveFiltersCount,
  } = useFiltersContext();

  // Получаем состояние загрузки для отображения индикаторов
  const { isLoading: isLoadingCuisines } = useCuisineTypes();
  const { isLoading: isLoadingFeatures } = useRestaurantFeatures();

  const handleApplyFilters = useCallback(() => {
    // Фильтры уже применены через контекст
    router.back();
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const selectedCount = getActiveFiltersCount();

  return (
    <SafeAreaView className="flex-1 bg-background-cream">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-neutral-100">
        <TouchableOpacity
          onPress={handleClose}
          className="w-8 h-8 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#000000" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center justify-center">
          <Typography variant="body1" className="font-semibold">
            Фильтры
          </Typography>
          {selectedCount > 0 && (
            <View className="ml-2 bg-primary-500 rounded-full w-6 h-6 items-center justify-center">
              <Typography
                color="inverse"
                variant="caption"
                className="text-white font-bold text-xs"
              >
                {selectedCount}
              </Typography>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={clearAllFilters}
          className="px-2 py-1 rounded-md"
          activeOpacity={0.7}
        >
          <Typography
            variant="caption"
            className="text-primary-500 font-medium"
          >
            Сбросить
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Price Categories */}
        <FilterSection
          title="Ценовой диапазон"
          options={filters.priceCategories}
          onOptionToggle={togglePriceCategory}
        />

        {/* Cuisine Types */}
        <FilterSection
          title="Тип кухни"
          options={filters.cuisines}
          onOptionToggle={toggleCuisine}
          isLoading={isLoadingCuisines}
        />

        {/* Features */}
        <FilterSection
          title="Удобства"
          options={filters.features}
          onOptionToggle={toggleFeature}
          isLoading={isLoadingFeatures}
        />

        <View className="h-20" />
      </ScrollView>

      {/* Bottom Action */}
      <View className="px-4 py-3 border-t border-neutral-100">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleApplyFilters}
        >
          Применить фильтры
          {selectedCount > 0 && ` (${selectedCount})`}
        </Button>
      </View>
    </SafeAreaView>
  );
}
