import { Restaurant } from "@/entities/Restaurant";
import { useFiltersContext } from "@/providers/FiltersProvider";
import { useMemo } from "react";
import { useRestaurants } from "./useRestaurants";

// Маппинг фильтров к полям ресторана
const CUISINE_MAPPING: Record<string, string[]> = {
  italian: ["Итальянская"],
  georgian: ["Грузинская"],
  kazakh: ["Казахская"],
  asian: ["Азиатская", "Японская", "Китайская", "Тайская"],
  european: ["Европейская", "Французская", "Немецкая"],
  american: ["Американская"],
};

const FEATURE_MAPPING: Record<string, keyof Restaurant["features"]> = {
  delivery: "hasDelivery",
  reservation: "hasReservation",
  wifi: "hasWifi",
  parking: "hasParking",
  child_menu: "hasChildMenu",
  vegan: "hasVeganOptions",
  alcohol: "hasAlcohol",
  cards: "acceptsCards",
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
  cuisines: FilterOption[];
  features: FilterOption[];
  tags: FilterOption[];
}

function filterRestaurants(
  restaurants: Restaurant[],
  filters: FiltersState
): Restaurant[] {
  return restaurants.filter((restaurant) => {
    // Фильтр по цене
    const avgPrice =
      (restaurant.features.averagePrice.min +
        restaurant.features.averagePrice.max) /
      2;
    if (
      avgPrice < filters.priceRange.min ||
      avgPrice > filters.priceRange.max
    ) {
      return false;
    }

    // Фильтр по типу кухни
    const selectedCuisines = filters.cuisines.filter((c) => c.isSelected);
    if (selectedCuisines.length > 0) {
      const hasMatchingCuisine = selectedCuisines.some((cuisine) => {
        const mappedCuisines = CUISINE_MAPPING[cuisine.id] || [];
        return restaurant.cuisine.some((restaurantCuisine) =>
          mappedCuisines.includes(restaurantCuisine)
        );
      });
      if (!hasMatchingCuisine) {
        return false;
      }
    }

    // Фильтр по удобствам
    const selectedFeatures = filters.features.filter((f) => f.isSelected);
    if (selectedFeatures.length > 0) {
      const hasAllFeatures = selectedFeatures.every((feature) => {
        const featureKey = FEATURE_MAPPING[feature.id];
        return featureKey && restaurant.features[featureKey];
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
  const {
    data: restaurants,
    isLoading,
    error,
    refetch,
  } = useRestaurants(searchQuery);

  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];
    return filterRestaurants(restaurants, filters);
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
      filters.priceRange.min !== 1000 ||
      filters.priceRange.max !== 15000,
  };
};
