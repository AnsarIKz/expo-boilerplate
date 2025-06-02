import { Restaurant } from "@/entities/Restaurant";
import { View } from "react-native";
import { Typography } from "./Typography";

interface RestaurantTagsProps {
  restaurant: Restaurant;
  variant?: "compact" | "detailed";
}

// Функция для получения всех тегов (кухня + особенности)
const getAllTags = (restaurant: Restaurant): string[] => {
  const tags: string[] = [];

  // Добавляем типы кухни
  tags.push(...restaurant.cuisine);

  // Добавляем особенности ресторана с более красивыми названиями
  if (restaurant.features.hasVeganOptions) tags.push("Vegan options");
  if (restaurant.features.hasChildMenu) tags.push("Kids' menu");
  if (restaurant.features.hasParking) tags.push("Parking");
  if (restaurant.features.hasWifi) tags.push("WiFi");
  if (restaurant.features.hasAlcohol) tags.push("Bar");
  if (restaurant.features.acceptsCards) tags.push("Cards");

  return tags;
};

export function RestaurantTags({
  restaurant,
  variant = "compact",
}: RestaurantTagsProps) {
  const allTags = getAllTags(restaurant);
  const isDetailed = variant === "detailed";

  return (
    <View className="flex-row flex-wrap gap-2">
      {allTags.slice(0, isDetailed ? 10 : 5).map((tag, index) => (
        <View
          key={`${tag}-${index}`}
          className="bg-primary-200 px-3 py-1.5 rounded-full"
        >
          <Typography
            variant="caption"
            className="text-primary-700 text-xs font-medium"
          >
            {tag}
          </Typography>
        </View>
      ))}
      {!isDetailed && allTags.length > 5 && (
        <View className="bg-primary-200 px-3 py-1.5 rounded-full">
          <Typography
            variant="caption"
            className="text-primary-700 text-xs font-medium"
          >
            +{allTags.length - 5} more
          </Typography>
        </View>
      )}
    </View>
  );
}
