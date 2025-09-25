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
  if (restaurant.cuisine && restaurant.cuisine.length > 0) {
    tags.push(...restaurant.cuisine);
  }

  // Добавляем особенности ресторана (теперь это массив строк)
  if (restaurant.features && restaurant.features.length > 0) {
    tags.push(...restaurant.features);
  }

  console.log("🏷️ Restaurant tags for", restaurant.name, ":", tags);
  console.log("🏷️ Cuisine:", restaurant.cuisine);
  console.log("🏷️ Features:", restaurant.features);

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
