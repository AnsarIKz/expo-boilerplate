import { Restaurant } from "@/entities/Restaurant";
import { useFiltersContext } from "@/providers/FiltersProvider";
import { useMemo } from "react";
import { useRestaurants } from "./useRestaurants";

// Функция для проверки соответствия кухни ресторана выбранным фильтрам
const matchesCuisineFilter = (
  restaurantCuisines: string[],
  selectedCuisineSlugs: string[]
): boolean => {
  if (selectedCuisineSlugs.length === 0) return true;

  // Проверяем, есть ли хотя бы одна выбранная кухня среди кухонь ресторана
  return selectedCuisineSlugs.some((slug) =>
    restaurantCuisines.some(
      (cuisine) =>
        cuisine.toLowerCase().includes(slug.toLowerCase()) ||
        slug.toLowerCase().includes(cuisine.toLowerCase())
    )
  );
};

const TAG_MAPPING: Record<string, string[]> = {
  pizza: ["Пицца"],
  pasta: ["Паста"],
  khachapuri: ["Хачапури"],
  khinkali: ["Хинкали"],
  fast_delivery: ["Быстрая доставка"],
  healthy: ["Здоровая еда"],
  romantic: ["Романтическая атмосфера"],
  family: ["Детское меню", "Семейный ресторан"],
};

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
  priceCategories: FilterOption[];
  cuisines: FilterOption[];
  features: FilterOption[];
  tags: FilterOption[];
}

function filterRestaurants(
  restaurants: Restaurant[],
  filters: FiltersState
): Restaurant[] {
  return restaurants.filter((restaurant) => {
    // Фильтр по цене (используем строковый priceRange)
    const priceRangeMap: { [key: string]: number } = {
      low: 2000, // ~$20
      medium: 5000, // ~$50
      high: 10000, // ~$100
    };

    const restaurantPrice = priceRangeMap[restaurant.priceRange || "medium"];
    if (
      restaurantPrice < filters.priceRange.min ||
      restaurantPrice > filters.priceRange.max
    ) {
      return false;
    }

    // Фильтр по типу кухни
    const selectedCuisines = filters.cuisines.filter((c) => c.isSelected);
    if (selectedCuisines.length > 0) {
      const selectedCuisineSlugs = selectedCuisines.map((c) => c.id);
      if (!matchesCuisineFilter(restaurant.cuisine, selectedCuisineSlugs)) {
        return false;
      }
    }

    // Фильтр по удобствам
    const selectedFeatures = filters.features.filter((f) => f.isSelected);
    if (selectedFeatures.length > 0) {
      const hasAllFeatures = selectedFeatures.every((feature) => {
        return restaurant.features.includes(feature.id);
      });
      if (!hasAllFeatures) {
        return false;
      }
    }

    // Фильтр по тегам/специализации
    const selectedTags = filters.tags.filter((t) => t.isSelected);
    if (selectedTags.length > 0) {
      const hasMatchingTag = selectedTags.some((tag) => {
        const mappedTags = TAG_MAPPING[tag.id] || [];
        return restaurant.tags.some((restaurantTag) =>
          mappedTags.includes(restaurantTag.label)
        );
      });
      if (!hasMatchingTag) {
        return false;
      }
    }

    return true;
  });
}

export const useFilteredRestaurants = (searchQuery?: string) => {
  const { filters } = useFiltersContext();

  // Подготавливаем фильтры для API
  const selectedCuisineSlugs = filters.cuisines
    .filter((c) => c.isSelected)
    .map((c) => c.id);

  const selectedFeatures = filters.features
    .filter((f) => f.isSelected)
    .map((f) => f.id);

  const selectedPriceCategories = filters.priceCategories
    .filter((c) => c.isSelected)
    .map((c) => c.id);

  const apiFilters = {
    ...(selectedCuisineSlugs.length > 0
      ? { cuisine_types: selectedCuisineSlugs }
      : {}),
    ...(selectedFeatures.length > 0 ? { features: selectedFeatures } : {}),
    ...(selectedPriceCategories.length > 0
      ? {
          price_range: selectedPriceCategories[0] as
            | "BUDGET"
            | "MODERATE"
            | "EXPENSIVE"
            | "VERY_EXPENSIVE",
        }
      : {}),
  };

  const {
    data: restaurants,
    isLoading,
    error,
    refetch,
  } = useRestaurants(searchQuery, apiFilters);

  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];
    // Применяем только клиентские фильтры (цена, tags)
    // Фильтры по кухне и удобствам уже применены на сервере
    return filterRestaurants(restaurants, {
      ...filters,
      cuisines: [], // Убираем фильтр кухни, так как он уже применен на сервере
      features: [], // Убираем фильтр удобств, так как он уже применен на сервере
    });
  }, [restaurants, filters]);

  return {
    data: filteredRestaurants,
    isLoading,
    error,
    refetch,
    hasFilters:
      filters.cuisines.some((c) => c.isSelected) ||
      filters.features.some((f) => f.isSelected) ||
      filters.tags.some((t) => t.isSelected) ||
      filters.priceCategories.some((c) => c.isSelected) ||
      filters.priceRange.min !== 1000 ||
      filters.priceRange.max !== 15000,
  };
};
