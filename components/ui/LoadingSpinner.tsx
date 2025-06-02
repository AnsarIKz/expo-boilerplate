import { ActivityIndicator, View } from "react-native";
import { Colors } from "../tokens";
import { Typography } from "./Typography";

interface LoadingSpinnerProps {
  text?: string;
  size?: "small" | "large";
  color?: string;
  className?: string;
}

export function LoadingSpinner({
  text = "Загрузка...",
  size = "large",
  color = Colors.primary[500],
  className = "",
}: LoadingSpinnerProps) {
  return (
    <View className={`flex-1 justify-center items-center py-16 ${className}`}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Typography
          variant="body2"
          color="secondary"
          className="mt-4 text-center"
        >
          {text}
        </Typography>
      )}
    </View>
  );
}
