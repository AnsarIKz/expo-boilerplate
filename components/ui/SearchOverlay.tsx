import { Restaurant } from "@/entities/Restaurant";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Typography } from "./Typography";

interface SearchOverlayProps {
  searchText: string;
  restaurants: Restaurant[];
  onRestaurantPress: (restaurantId: string) => void;
  onFeaturePress: (feature: string) => void;
  onClose: () => void;
}

const AVAILABLE_FEATURES = [
  { id: "delivery", label: "Delivery", icon: "bicycle-outline" },
  { id: "reservation", label: "Reservation", icon: "calendar-outline" },
  { id: "vegan", label: "Vegan options", icon: "leaf-outline" },
  { id: "kids", label: "Kid's menu", icon: "happy-outline" },
  { id: "parking", label: "Parking", icon: "car-outline" },
  { id: "wifi", label: "WiFi", icon: "wifi-outline" },
  { id: "alcohol", label: "Alcohol", icon: "wine-outline" },
  { id: "cards", label: "Cards accepted", icon: "card-outline" },
];

export function SearchOverlay({
  searchText,
  restaurants,
  onRestaurantPress,
  onFeaturePress,
  onClose,
}: SearchOverlayProps) {
  // Фильтруем features по поисковому запросу
  const filteredFeatures = AVAILABLE_FEATURES.filter((feature) =>
    feature.label.toLowerCase().includes(searchText.toLowerCase())
  );

  // Фильтруем рестораны по поисковому запросу
  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchText.toLowerCase()) ||
      restaurant.cuisine.some((cuisine) =>
        cuisine.toLowerCase().includes(searchText.toLowerCase())
      )
  );

  return (
    <View className="absolute top-14 left-0 right-0 bottom-0 bg-white z-10">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Features Section */}
        {filteredFeatures.length > 0 && (
          <View className="px-4 py-4">
            <Typography variant="h6" className="text-text-primary mb-3">
              Features
            </Typography>
            <View className="flex-row flex-wrap gap-2">
              {filteredFeatures.map((feature) => (
                <TouchableOpacity
                  key={feature.id}
                  className="bg-primary-200 px-3 py-2 rounded-full flex-row items-center"
                  onPress={() => onFeaturePress(feature.label)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={feature.icon as any}
                    size={16}
                    color="#bd561c"
                  />
                  <Typography
                    variant="caption"
                    className="ml-2 text-primary-700"
                  >
                    {feature.label}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Restaurants Section */}
        {filteredRestaurants.length > 0 && (
          <View className="px-4 py-4">
            <Typography variant="h6" className="text-text-primary mb-3">
              Restaurants
            </Typography>
            <View className="gap-3">
              {filteredRestaurants.slice(0, 10).map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  className="flex-row items-center bg-white"
                  onPress={() => onRestaurantPress(restaurant.id)}
                  activeOpacity={0.7}
                >
                  {/* Restaurant Image */}
                  <View className="w-12 h-12 rounded-lg overflow-hidden mr-3">
                    <Image
                      source={{ uri: restaurant.image }}
                      className="w-full h-full"
                      contentFit="cover"
                      placeholder="https://placehold.co/48x48/f0f0f0/cccccc"
                    />
                  </View>

                  {/* Restaurant Info */}
                  <View className="flex-1">
                    <Typography
                      variant="body1"
                      className="text-text-primary font-medium"
                      numberOfLines={1}
                    >
                      {restaurant.name}
                    </Typography>
                    <View className="flex-row items-center mt-1">
                      <View className="flex-row items-center mr-2">
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Typography
                          variant="caption"
                          className="ml-1 text-neutral-600"
                        >
                          {restaurant.rating} ({restaurant.reviewCount})
                        </Typography>
                      </View>
                      <Typography
                        variant="caption"
                        className="text-neutral-500"
                      >
                        {restaurant.cuisine.join(", ")}
                      </Typography>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {filteredFeatures.length === 0 && filteredRestaurants.length === 0 && (
          <View className="px-4 py-8 items-center">
            <Ionicons name="search-outline" size={48} color="#a5a5a5" />
            <Typography
              variant="body1"
              className="text-neutral-500 mt-2 text-center"
            >
              No results found for "{searchText}"
            </Typography>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
