import { Restaurant } from "@/entities/Restaurant";
import { useFavorites } from "@/hooks/useFavorites";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { TouchableOpacity, View } from "react-native";
import { Colors } from "../tokens";
import { Card } from "./Card";
import { Typography } from "./Typography";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: (restaurantId: string) => void;
}

// Функция для форматирования цены в стиле $$
const formatPriceLevel = (price: {
  min: number;
  max: number;
  currency: string;
}): string => {
  if (price.currency === "KZT") {
    const avgPrice = (price.min + price.max) / 2;
    if (avgPrice < 3000) return "$";
    if (avgPrice < 6000) return "$$";
    if (avgPrice < 10000) return "$$$";
    return "$$$$";
  }
  // For other currencies, use simple logic
  const avgPrice = (price.min + price.max) / 2;
  if (avgPrice < 15) return "$";
  if (avgPrice < 30) return "$$";
  if (avgPrice < 50) return "$$$";
  return "$$$$";
};

// Функция для получения всех тегов (кухня + особенности)
const getAllTags = (restaurant: Restaurant): string[] => {
  const tags: string[] = [];

  // Добавляем типы кухни
  tags.push(...restaurant.cuisine);

  // Добавляем особенности ресторана
  if (restaurant.features.hasDelivery) tags.push("Delivery");
  if (restaurant.features.hasReservation) tags.push("Reservation");
  if (restaurant.features.hasVeganOptions) tags.push("Vegan options");
  if (restaurant.features.hasChildMenu) tags.push("Kid's menu");
  if (restaurant.features.hasParking) tags.push("Parking");
  if (restaurant.features.hasWifi) tags.push("WiFi");
  if (restaurant.features.hasAlcohol) tags.push("Alcohol");
  if (restaurant.features.acceptsCards) tags.push("Cards accepted");

  return tags;
};

export function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  const priceLevel = formatPriceLevel(restaurant.features.averagePrice);
  const allTags = getAllTags(restaurant);

  // Хук для работы с избранным
  const { isFavorite, toggleFavorite } = useFavorites();
  const isRestaurantFavorite = isFavorite(restaurant.id);

  const handleFavoritePress = (e: any) => {
    e.stopPropagation(); // Предотвращаем всплытие события к onPress карточки
    toggleFavorite(restaurant);
  };

  return (
    <Card
      variant="elevated"
      padding="none"
      onPress={() => onPress(restaurant.id)}
      className="mx-6 mb-6 overflow-hidden rounded-2xl"
    >
      {/* Image Container */}
      <View className="relative h-[240px]">
        <Image
          source={{ uri: restaurant.image }}
          className="w-full h-full"
          contentFit="cover"
          placeholder="https://placehold.co/362x240/f0f0f0/cccccc?text=Загрузка..."
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
            {restaurant.rating} ({restaurant.reviewCount})
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
      </View>
    </Card>
  );
}
