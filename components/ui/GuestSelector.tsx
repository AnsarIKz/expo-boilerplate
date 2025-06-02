import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../tokens";
import { Typography } from "./Typography";

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function GuestSelector({
  value,
  onChange,
  min = 1,
  max = 10,
  label = "Number of guests",
}: GuestSelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <View>
      {label && (
        <Typography variant="body1" className="text-text-primary mb-3">
          {label}
        </Typography>
      )}

      <View className="flex-row items-center justify-center">
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={value <= min}
          className={`w-12 h-12 rounded-lg border-2 border-neutral-300 items-center justify-center ${
            value <= min ? "opacity-50" : ""
          }`}
          activeOpacity={0.7}
        >
          <Ionicons
            name="remove"
            size={20}
            color={value <= min ? Colors.neutral[400] : Colors.neutral[600]}
          />
        </TouchableOpacity>

        <View className="mx-6 min-w-[60px] h-12 border border-neutral-300 rounded-lg items-center justify-center bg-white">
          <Text className="font-sf-pro font-medium text-lg text-text-primary">
            {value}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={value >= max}
          className={`w-12 h-12 rounded-lg border-2 border-neutral-300 items-center justify-center ${
            value >= max ? "opacity-50" : ""
          }`}
          activeOpacity={0.7}
        >
          <Ionicons
            name="add"
            size={20}
            color={value >= max ? Colors.neutral[400] : Colors.neutral[600]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
