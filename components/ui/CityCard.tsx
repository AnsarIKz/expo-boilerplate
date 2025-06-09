import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import { City } from "@/hooks/useSelectedCity";
import { Colors } from "../tokens";
import { Typography } from "./Typography";

interface CityCardProps {
  city: City;
  isSelected: boolean;
  onPress: (city: City) => void;
}

export function CityCard({ city, isSelected, onPress }: CityCardProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 px-4 border-b border-neutral-100"
      onPress={() => onPress(city)}
      activeOpacity={0.7}
    >
      <View className="flex-1">
        <Typography
          variant="body1"
          className={`font-semibold ${
            isSelected ? "text-primary-500" : "text-text-primary"
          }`}
        >
          {city.name}
        </Typography>
        <Typography variant="caption" className="text-text-secondary mt-1">
          {city.region}
        </Typography>
      </View>
      {isSelected ? (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={Colors.primary[600]}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.neutral[400]}
        />
      )}
    </TouchableOpacity>
  );
}
