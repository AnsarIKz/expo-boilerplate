import { Restaurant } from "@/entities/Restaurant";
import { useFavorites } from "@/hooks/useFavorites";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Colors } from "../tokens";
import { Card } from "./Card";
import { Typography } from "./Typography";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: (restaurantId: string) => void;
}

// Функция для форматирования цены в стиле $$ на основе priceRange
const formatPriceLevel = (priceRange: "low" | "medium" | "high"): string => {
  switch (priceRange) {
    case "low":
      return "$";
    case "medium":
      return "$$";
    case "high":
      return "$$$";
    default:
      return "$$";
  }
};

// Функция для получения всех тегов из реальных данных
const getAllTags = (restaurant: Restaurant): string[] => {
  const tags: string[] = [];

  // Добавляем типы кухни из реальных данных
  if (restaurant.cuisine && restaurant.cuisine.length > 0) {
    tags.push(...restaurant.cuisine);
  }

  // Добавляем features (особенности ресторана)
  if (restaurant.features && restaurant.features.length > 0) {
    console.log("🏪 Restaurant features:", restaurant.features);
    tags.push(...restaurant.features);
  }

  console.log("🏪 All tags for", restaurant.name, ":", tags);
  return tags;
};

export const RestaurantCard = React.memo(function RestaurantCard({
  restaurant,
  onPress,
}: RestaurantCardProps) {
  const priceLevel = formatPriceLevel(restaurant.priceRange || "medium");
  const allTags = getAllTags(restaurant);
  const [isPressed, setIsPressed] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Хук для работы с избранным
  const { isFavorite, toggleFavorite } = useFavorites();
  const isRestaurantFavorite = isFavorite(restaurant.id);

  const handleFavoritePress = useCallback(
    (e: any) => {
      e.stopPropagation(); // Предотвращаем всплытие события к onPress карточки
      toggleFavorite(restaurant);
    },
    [toggleFavorite, restaurant]
  );

  const handleCardPress = useCallback(() => {
    if (isPressed) return; // Предотвращаем множественные нажатия

    setIsPressed(true);
    onPress(restaurant.id);

    // Сбрасываем флаг через небольшую задержку
    setTimeout(() => setIsPressed(false), 1000);
  }, [isPressed, onPress, restaurant.id]);

  return (
    <Card
      variant="elevated"
      padding="none"
      onPress={handleCardPress}
      className="mx-6 mb-6 overflow-hidden rounded-2xl"
    >
      {/* Image Container */}
      <View className="relative h-[240px]">
        <Image
          source={{ uri: restaurant.image }}
          className="w-full h-full"
          contentFit="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
          transition={200}
        />

        {/* Favorite Icon - теперь всегда показывается */}
        <TouchableOpacity
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-lg"
          onPress={handleFavoritePress}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isRestaurantFavorite ? "heart" : "heart-outline"}
            size={20}
            color={
              isRestaurantFavorite ? Colors.error.main : Colors.neutral[600]
            }
          />
        </TouchableOpacity>

        {/* Rating Badge - остается на том же месте */}
        <View className="absolute bottom-3 left-3 flex-row items-center bg-black/75 px-3 py-1.5 rounded-full">
          <Ionicons name="star" size={16} color={Colors.star} />
          <Typography
            variant="caption"
            color="inverse"
            className="ml-1.5 text-sm"
          >
            {restaurant.rating.toFixed(1)} ({restaurant.reviewCount})
          </Typography>
        </View>
      </View>

      {/* Content */}
      <View className="bg-background-secondary px-4 py-4">
        {/* Header: Name and Price */}
        <View className="flex-row justify-between items-start mb-3">
          <Typography
            variant="h5"
            className="text-text-primary flex-1 mr-3"
            numberOfLines={1}
          >
            {restaurant.name}
          </Typography>
          <Typography variant="h6" className="text-neutral-600">
            {priceLevel}
          </Typography>
        </View>

        {/* All Tags in one row */}
        {allTags.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {allTags.slice(0, 5).map((tag, index) => (
              <View
                key={`${tag}-${index}`}
                className="bg-primary-200 px-3 py-1.5 rounded-full"
              >
                <Typography
                  variant="caption"
                  className="text-primary-700 text-xs"
                >
                  {tag}
                </Typography>
              </View>
            ))}
            {allTags.length > 5 && (
              <View className="bg-primary-200 px-3 py-1.5 rounded-full">
                <Typography
                  variant="caption"
                  className="text-primary-700 text-xs"
                >
                  +{allTags.length - 5} more
                </Typography>
              </View>
            )}
          </View>
        )}
      </View>
    </Card>
  );
});
