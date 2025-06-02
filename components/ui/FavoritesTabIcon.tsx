import { useFavoritesStore } from "@/stores/favoritesStore";
import { View } from "react-native";
import { IconSymbol } from "./IconSymbol";

interface FavoritesTabIconProps {
  color: string;
  focused: boolean;
  size?: number;
}

export function FavoritesTabIcon({
  color,
  focused,
  size = 24,
}: FavoritesTabIconProps) {
  const { getFavoritesCount } = useFavoritesStore();
  const count = getFavoritesCount();

  return (
    <View className="relative">
      <IconSymbol
        size={size}
        name={focused ? "heart.fill" : "heart"}
        color={color}
      />
    </View>
  );
}
