import { RestaurantFilters } from "@/lib/api/restaurant";
import { useRestaurantApi, useRestaurantsApi } from "./api/useRestaurantsApi";

// Хук для получения списка ресторанов (обновлен для использования реального API)
export const useRestaurants = (
  searchQuery?: string,
  additionalFilters?: Partial<RestaurantFilters>
) => {
  // Используем реальный API
  const filters: RestaurantFilters | undefined =
    searchQuery || additionalFilters
      ? {
          ...(searchQuery ? { search: searchQuery } : {}),
          ...additionalFilters,
        }
      : undefined;
  const apiQuery = useRestaurantsApi(filters);

  // Для обратной совместимости возвращаем тот же формат
  return {
    ...apiQuery,
    data: apiQuery.data || [],
  };
};

// Хук для получения ресторана по ID (только реальный API)
export const useRestaurant = (id: string) => {
  // Используем только реальный API
  return useRestaurantApi(id);
};
