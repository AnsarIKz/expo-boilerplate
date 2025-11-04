import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { RestaurantCard } from "@/components/ui/RestaurantCard";
import { TitleHeader } from "@/components/ui/TitleHeader";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useFavoritesStore } from "@/stores/favoritesStore";

export default function FavoritesScreen() {
  const { favorites, getFavoritesCount } = useFavoritesStore();
  const { data: allRestaurants = [] } = useRestaurants("");
  const [isNavigating, setIsNavigating] = useState(false);

  // Получаем полные данные ресторанов из избранного
  const favoriteRestaurants = useMemo(() => {
    return favorites.map((favorite) => {
      const fullRestaurant = allRestaurants.find((r) => r.id === favorite.id);
      return (
        fullRestaurant || {
          id: favorite.id,
          name: favorite.name,
          image: favorite.image,
          rating: favorite.rating,
          reviewCount: 0,
          tags: [],
          location: { address: "", city: "", district: "" },
          workingHours: {
            monday: "09:00-22:00",
            tuesday: "09:00-22:00",
            wednesday: "09:00-22:00",
            thursday: "09:00-22:00",
            friday: "09:00-22:00",
            saturday: "09:00-22:00",
            sunday: "09:00-22:00",
          },
          contact: { phone: "" },
          features: {
            hasDelivery: false,
            hasReservation: false,
            hasWifi: false,
            hasParking: false,
            hasChildMenu: false,
            hasVeganOptions: false,
            hasAlcohol: false,
            acceptsCards: false,
            averagePrice: { min: 2000, max: 5000, currency: "KZT" },
          },
          cuisine: [],
          createdAt: "",
          updatedAt: "",
          isActive: true,
        }
      );
    });
  }, [favorites, allRestaurants]);

  const handleRestaurantPress = useCallback(
    (restaurantId: string) => {
      if (isNavigating) return; // Предотвращаем множественные нажатия

      setIsNavigating(true);
      router.push(`/restaurant/${restaurantId}` as any);

      // Сбрасываем флаг через небольшую задержку
      setTimeout(() => setIsNavigating(false), 1000);
    },
    [isNavigating]
  );

  const favoritesCount = getFavoritesCount();

  const pluralForm = useMemo(() => {
    if (favoritesCount === 0) return "ресторанов";
    if (favoritesCount === 1) return "ресторан";
    if (favoritesCount >= 2 && favoritesCount <= 4) return "ресторана";
    return "ресторанов";
  }, [favoritesCount]);

  return (
    <SafeAreaView className="flex-1 bg-background-primary pb-12">
      {/* Header */}
      <TitleHeader
        title="Избранное"
        subtitle={
          favoritesCount > 0 ? `${favoritesCount} ${pluralForm}` : undefined
        }
      />

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          favoritesCount === 0
            ? { flexGrow: 1, paddingBottom: 20 }
            : { paddingBottom: 20 }
        }
      >
        {favoritesCount === 0 ? (
          <EmptyState
            title="Пока нет избранных"
            subtitle="Добавляйте рестораны в избранное, нажимая на сердечко"
            iconName="heart-outline"
          />
        ) : (
          <View className="pt-2">
            {favoriteRestaurants.map((restaurant) => {
              const featuresAsArray = restaurant.features
                ? Object.entries(restaurant.features)
                    .filter(([, value]) => value)
                    .map(([key]) => key)
                : [];

              return (
                <View className="px-4">
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={{ ...restaurant, features: featuresAsArray }}
                    onPress={handleRestaurantPress}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
