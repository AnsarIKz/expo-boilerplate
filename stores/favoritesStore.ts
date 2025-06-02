import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Fallback storage for web/testing
const storage = {
  getItem: async (name: string) => {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem(name);
    } catch {
      return localStorage.getItem(name);
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.setItem(name, value);
    } catch {
      return localStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string) => {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.removeItem(name);
    } catch {
      return localStorage.removeItem(name);
    }
  },
};

export interface FavoriteRestaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  addedAt: string;
}

interface FavoritesStore {
  favorites: FavoriteRestaurant[];
  addToFavorites: (restaurant: FavoriteRestaurant) => void;
  removeFromFavorites: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;
  clearFavorites: () => void;
  getFavoritesCount: () => number;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      addToFavorites: (restaurant: FavoriteRestaurant) => {
        set((state) => ({
          favorites: [
            ...state.favorites,
            { ...restaurant, addedAt: new Date().toISOString() },
          ],
        }));
      },

      removeFromFavorites: (restaurantId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== restaurantId),
        }));
      },

      isFavorite: (restaurantId: string) => {
        const { favorites } = get();
        return favorites.some((fav) => fav.id === restaurantId);
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },

      getFavoritesCount: () => {
        const { favorites } = get();
        return favorites.length;
      },
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => storage),
    }
  )
);
