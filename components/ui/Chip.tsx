import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

interface ChipProps {
  label: string;
  isSelected?: boolean;
  onPress: () => void;
  variant?: "filter" | "category";
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Chip({
  label,
  isSelected = false,
  onPress,
  variant = "category",
  icon,
}: ChipProps) {
  if (variant === "filter") {
    return (
      <TouchableOpacity
        className="flex-row items-center justify-center bg-primary-500 px-4 rounded-[10px] h-[42px]"
        onPress={onPress}
      >
        {icon && <Ionicons name={icon} size={16} color="white" />}
        <Text
          className={`text-white text-[15px] font-sf-pro ${icon ? "ml-2" : ""}`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className={`px-4 rounded-[10px] border h-[42px] justify-center items-center ${
        isSelected
          ? "bg-background-cream border-primary-500"
          : "bg-white border-neutral-400"
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-[15px] font-sf-pro ${
          isSelected ? "text-primary-500" : "text-neutral-900"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
