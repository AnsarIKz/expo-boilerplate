import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LocationHeader } from "@/components/ui/LocationHeader";
import { RestaurantCard } from "@/components/ui/RestaurantCard";
import { SearchWrapper } from "@/components/ui/SearchWrapper";
import { FilterChip } from "@/entities/Restaurant";
import { useCuisineTypes } from "@/hooks/api/useRestaurantsApi";
import { useFilteredRestaurants } from "@/hooks/useFilteredRestaurants";
import { useCityContext } from "@/providers/CityProvider";
import { useFiltersContext } from "@/providers/FiltersProvider";

// Убираем мок данные - используем реальные данные из API
const initialFilterChips: FilterChip[] = [];

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");
  const [filterChips, setFilterChips] = useState(initialFilterChips);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { getDisplayName } = useCityContext();
  const { getActiveFiltersCount } = useFiltersContext();

  // Получаем типы кухонь из API
  const { data: cuisineTypes = [] } = useCuisineTypes();

  // Заполняем фильтр-чипы первыми 10 кухнями при загрузке
  useEffect(() => {
    if (cuisineTypes.length > 0 && filterChips.length === 0) {
      const firstTenCuisines = cuisineTypes.slice(0, 10);
      setFilterChips(firstTenCuisines);
    }
  }, [cuisineTypes, filterChips.length]);

  // Refs для анимации и скролла
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);

  // Используем отфильтрованные рестораны
  const {
    data: restaurants = [],
    isLoading,
    error,
    refetch,
    hasFilters,
  } = useFilteredRestaurants(searchText);

  // Мемоизированное фильтрование ресторанов по локальным чипам для оптимизации производительности
  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];

    return restaurants.filter((restaurant: any) => {
      const selectedChipLabels = filterChips
        .filter((chip) => chip.isSelected)
        .map((chip) => chip.label.toLowerCase());

      const matchesFilters =
        selectedChipLabels.length === 0 ||
        restaurant.cuisine.some((cuisine: string) =>
          selectedChipLabels.some(
            (chipLabel) =>
              cuisine.toLowerCase().includes(chipLabel) ||
              chipLabel.includes(cuisine.toLowerCase())
          )
        );

      return matchesFilters;
    });
  }, [restaurants, filterChips]);

  // Обработка скролла для показа кнопок
  const handleScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const shouldShow = offsetY > 100; // Показываем кнопки после 100px скролла

      if (shouldShow !== showFloatingButtons) {
        setShowFloatingButtons(shouldShow);
      }
    },
    [showFloatingButtons]
  );

  // Функции для скролла к поиску и фильтрам
  const scrollToSearch = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const scrollToFilters = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 80, animated: true });
  }, []);

  // useCallback для предотвращения пересоздания функций при каждом рендере
  const handleChipPress = useCallback((chipId: string) => {
    setFilterChips((prev) =>
      prev.map((chip) =>
        chip.id === chipId ? { ...chip, isSelected: !chip.isSelected } : chip
      )
    );
  }, []);

  const handleFilterPress = useCallback(() => {
    router.push("/filters");
  }, []);

  const handleRestaurantPress = useCallback((restaurantId: string) => {
    router.push(`/restaurant/${restaurantId}` as any);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleSearchFocusChange = useCallback((isFocused: boolean) => {
    setIsSearchFocused(isFocused);
  }, []);

  const handleLocationPress = useCallback(() => {
    router.push("/city-selector");
  }, []);

  // Рендер списка ресторанов
  const renderRestaurantList = () => {
    if (isLoading) {
      return <LoadingSpinner text="Поиск ресторанов..." />;
    }

    if (error) {
      return (
        <EmptyState
          title="Ошибка загрузки"
          subtitle="Не удалось загрузить рестораны. Попробуйте еще раз."
          iconName="alert-circle-outline"
        />
      );
    }

    if (filteredRestaurants.length === 0) {
      return (
        <EmptyState
          title="Ничего не найдено"
          subtitle="Попробуйте изменить параметры поиска или фильтры"
          iconName="restaurant-outline"
        />
      );
    }

    return (
      <View>
        {filteredRestaurants.map((restaurant: any) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onPress={handleRestaurantPress}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-background-primary">
        {/* Fixed Header with animated buttons */}

        <LocationHeader
          city={getDisplayName()}
          onPress={handleLocationPress}
          showFloatingButtons={showFloatingButtons}
          onSearchPress={scrollToSearch}
          onFilterPress={handleFilterPress}
          activeFiltersCount={getActiveFiltersCount()}
        />

        {/* Scrollable Content including Search and Filters */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={
            filteredRestaurants.length === 0 && !isLoading
              ? { flexGrow: 1, paddingBottom: 20 }
              : { paddingBottom: 20 }
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading && !isSearchFocused}
              onRefresh={refetch}
              enabled={!isSearchFocused}
              tintColor="#bd561c"
              colors={["#bd561c"]}
            />
          }
        >
          {/* Search Bar - now scrollable */}
          <View className="pb-3">
            <SearchWrapper
              placeholder="Название ресторана, тип кухни"
              value={searchText}
              onChangeText={handleSearchChange}
              restaurants={restaurants || []}
              onRestaurantPress={handleRestaurantPress}
              onFocusChange={handleSearchFocusChange}
            />
          </View>

          {/* Filters - now scrollable */}
          <View className="mb-4">
            <FilterChips
              chips={filterChips}
              onChipPress={handleChipPress}
              onFilterPress={handleFilterPress}
            />
          </View>

          {/* Restaurant List */}
          {renderRestaurantList()}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
