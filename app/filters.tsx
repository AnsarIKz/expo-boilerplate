import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { FilterSection } from "@/components/ui/FilterSection";
import { PriceRangeSlider } from "@/components/ui/PriceRangeSlider";
import { Typography } from "@/components/ui/Typography";
import { useFiltersContext } from "@/providers/FiltersProvider";

// Типы фильтров
interface FilterOption {
  id: string;
  label: string;
  isSelected: boolean;
}

interface FiltersState {
  priceRange: {
    min: number;
    max: number;
  };
  cuisines: FilterOption[];
  features: FilterOption[];
  tags: FilterOption[];
}

// Моковые данные для фильтров
const INITIAL_FILTERS: FiltersState = {
  priceRange: {
    min: 1000,
    max: 15000,
  },
  cuisines: [
    { id: "italian", label: "Итальянская кухня", isSelected: false },
    { id: "georgian", label: "Грузинская кухня", isSelected: false },
    { id: "kazakh", label: "Казахская кухня", isSelected: false },
    { id: "asian", label: "Азиатская кухня", isSelected: false },
    { id: "european", label: "Европейская кухня", isSelected: false },
    { id: "american", label: "Американская кухня", isSelected: false },
  ],
  features: [
    { id: "delivery", label: "Доставка", isSelected: false },
    { id: "reservation", label: "Бронирование", isSelected: false },
    { id: "wifi", label: "Wi-Fi", isSelected: false },
    { id: "parking", label: "Парковка", isSelected: false },
    { id: "child_menu", label: "Детское меню", isSelected: false },
    { id: "vegan", label: "Веганские блюда", isSelected: false },
    { id: "alcohol", label: "Алкоголь", isSelected: false },
    { id: "cards", label: "Карты", isSelected: false },
  ],
  tags: [
    { id: "pizza", label: "Пицца", isSelected: false },
    { id: "pasta", label: "Паста", isSelected: false },
    { id: "khachapuri", label: "Хачапури", isSelected: false },
    { id: "khinkali", label: "Хинкали", isSelected: false },
    { id: "fast_delivery", label: "Быстрая доставка", isSelected: false },
    { id: "healthy", label: "Здоровая еда", isSelected: false },
    { id: "romantic", label: "Романтическая атмосфера", isSelected: false },
    { id: "family", label: "Семейный ресторан", isSelected: false },
  ],
};

export default function FiltersScreen() {
  const [isSliderActive, setIsSliderActive] = useState(false);
  const {
    filters,
    updatePriceRange,
    toggleCuisine,
    toggleFeature,
    toggleTag,
    clearAllFilters,
    getActiveFiltersCount,
  } = useFiltersContext();

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
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isSliderActive}
      >
        {/* Price Range */}
        <PriceRangeSlider
          minPrice={1000}
          maxPrice={15000}
          currentMin={filters.priceRange.min}
          currentMax={filters.priceRange.max}
          onRangeChange={updatePriceRange}
          onSliderActiveChange={setIsSliderActive}
        />

        {/* Cuisine Types */}
        <FilterSection
          title="Тип кухни"
          options={filters.cuisines}
          onOptionToggle={toggleCuisine}
        />

        {/* Features */}
        <FilterSection
          title="Удобства"
          options={filters.features}
          onOptionToggle={toggleFeature}
        />

        {/* Tags */}
        <FilterSection
          title="Специализация"
          options={filters.tags}
          onOptionToggle={toggleTag}
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
