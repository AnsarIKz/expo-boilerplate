import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
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

// Начальное состояние фильтров
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

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

interface FiltersProviderProps {
  children: ReactNode;
}

export function FiltersProvider({ children }: FiltersProviderProps) {
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);

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
