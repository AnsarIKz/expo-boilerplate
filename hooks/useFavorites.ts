import { Restaurant } from "@/entities/Restaurant";
import { FavoriteRestaurant, useFavoritesStore } from "@/stores/favoritesStore";
import { useCallback } from "react";

export function useFavorites() {
  const {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesCount,
  } = useFavoritesStore();

  const toggleFavorite = useCallback(
    (restaurant: Restaurant) => {
      if (isFavorite(restaurant.id)) {
        removeFromFavorites(restaurant.id);
      } else {
        const favoriteData: FavoriteRestaurant = {
          id: restaurant.id,
          name: restaurant.name,
          image: restaurant.image,
          rating: restaurant.rating,
          addedAt: new Date().toISOString(),
        };
        addToFavorites(favoriteData);
      }
    },
    [isFavorite, addToFavorites, removeFromFavorites]
  );

  return {
    favorites,
    favoritesCount: getFavoritesCount(),
    isFavorite,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
  };
}
