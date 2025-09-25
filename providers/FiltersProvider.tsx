import {
  useCuisineTypes,
  useRestaurantFeatures,
} from "@/hooks/api/useRestaurantsApi";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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

interface FiltersContextType {
  filters: FiltersState;
  updatePriceRange: (min: number, max: number) => void;
  toggleCuisine: (id: string) => void;
  toggleFeature: (id: string) => void;
  toggleTag: (id: string) => void;
  clearAllFilters: () => void;
  getActiveFiltersCount: () => number;
  hasActiveFilters: () => boolean;
}

// Fallback данные для демонстрации (если API недоступен)
const FALLBACK_CUISINES = [
  { id: "italian", label: "Italian", isSelected: false },
  { id: "chinese", label: "Chinese", isSelected: false },
  { id: "japanese", label: "Japanese", isSelected: false },
  { id: "mexican", label: "Mexican", isSelected: false },
];

const FALLBACK_FEATURES = [
  { id: "WIFI", label: "Wi-Fi", isSelected: false },
  { id: "PARKING", label: "Parking", isSelected: false },
  { id: "DELIVERY", label: "Delivery", isSelected: false },
  { id: "TAKEOUT", label: "Takeout", isSelected: false },
  { id: "OUTDOOR_SEATING", label: "Outdoor Seating", isSelected: false },
];

// Начальное состояние фильтров
const INITIAL_FILTERS: FiltersState = {
  priceRange: {
    min: 1000,
    max: 15000,
  },
  cuisines: FALLBACK_CUISINES, // Используем fallback данные
  features: FALLBACK_FEATURES, // Используем fallback данные
  tags: [],
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

interface FiltersProviderProps {
  children: ReactNode;
}

export function FiltersProvider({ children }: FiltersProviderProps) {
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const { data: cuisineTypes, isLoading: isLoadingCuisines } =
    useCuisineTypes();
  const { data: restaurantFeatures, isLoading: isLoadingFeatures } =
    useRestaurantFeatures();

  // Загружаем типы кухонь из API при инициализации
  useEffect(() => {
    if (cuisineTypes && cuisineTypes.length > 0) {
      console.log("🍽️ Loading cuisine types from API:", cuisineTypes.length);
      setFilters((prev) => ({
        ...prev,
        cuisines: cuisineTypes,
      }));
    }
  }, [cuisineTypes]);

  // Загружаем удобства из API при инициализации
  useEffect(() => {
    if (restaurantFeatures && restaurantFeatures.length > 0) {
      console.log("🏪 Loading features from API:", restaurantFeatures.length);
      setFilters((prev) => ({
        ...prev,
        features: restaurantFeatures,
      }));
    }
  }, [restaurantFeatures]);

  const updatePriceRange = useCallback((min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: { min, max },
    }));
  }, []);

  const toggleCuisine = useCallback((id: string) => {
    setFilters((prev) => ({
      ...prev,
      cuisines: prev.cuisines.map((cuisine) =>
        cuisine.id === id
          ? { ...cuisine, isSelected: !cuisine.isSelected }
          : cuisine
      ),
    }));
  }, []);

  const toggleFeature = useCallback((id: string) => {
    setFilters((prev) => ({
      ...prev,
      features: prev.features.map((feature) =>
        feature.id === id
          ? { ...feature, isSelected: !feature.isSelected }
          : feature
      ),
    }));
  }, []);

  const toggleTag = useCallback((id: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.map((tag) =>
        tag.id === id ? { ...tag, isSelected: !tag.isSelected } : tag
      ),
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      priceRange: {
        min: INITIAL_FILTERS.priceRange.min,
        max: INITIAL_FILTERS.priceRange.max,
      },
      cuisines: INITIAL_FILTERS.cuisines.map((cuisine) => ({
        ...cuisine,
        isSelected: false,
      })),
      features: INITIAL_FILTERS.features.map((feature) => ({
        ...feature,
        isSelected: false,
      })),
      tags: INITIAL_FILTERS.tags.map((tag) => ({ ...tag, isSelected: false })),
    });
  }, []);

  const getActiveFiltersCount = useCallback(() => {
    const selectedCuisines = filters.cuisines.filter(
      (c) => c.isSelected
    ).length;
    const selectedFeatures = filters.features.filter(
      (f) => f.isSelected
    ).length;
    const selectedTags = filters.tags.filter((t) => t.isSelected).length;
    const priceChanged =
      filters.priceRange.min !== INITIAL_FILTERS.priceRange.min ||
      filters.priceRange.max !== INITIAL_FILTERS.priceRange.max;

    return (
      selectedCuisines +
      selectedFeatures +
      selectedTags +
      (priceChanged ? 1 : 0)
    );
  }, [filters]);

  const hasActiveFilters = useCallback(() => {
    return getActiveFiltersCount() > 0;
  }, [getActiveFiltersCount]);

  const value: FiltersContextType = {
    filters,
    updatePriceRange,
    toggleCuisine,
    toggleFeature,
    toggleTag,
    clearAllFilters,
    getActiveFiltersCount,
    hasActiveFilters,
  };

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
}

export function useFiltersContext() {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error("useFiltersContext must be used within a FiltersProvider");
  }
  return context;
}
