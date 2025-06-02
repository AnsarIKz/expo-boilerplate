import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Colors } from "../tokens";
import { Typography } from "./Typography";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  className?: string;
}

export function EmptyState({
  title,
  subtitle,
  iconName = "restaurant-outline",
  iconSize = 64,
  className = "",
}: EmptyStateProps) {
  return (
    <View
      className={`flex-1 justify-center items-center px-8 py-16 ${className}`}
    >
      {iconName && (
        <View className="mb-6">
          <Ionicons
            name={iconName}
            size={iconSize}
            color={Colors.neutral[400]}
          />
        </View>
      )}

      <Typography variant="h5" color={"secondary"} className="text-center mb-2">
        {title}
      </Typography>

      {/* {subtitle && (
        <Typography
          variant="body2"
          color="secondary"
          className="text-center leading-6"
        >
          {subtitle}
        </Typography>
      )} */}
    </View>
  );
}
