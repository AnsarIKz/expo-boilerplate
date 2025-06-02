import { ScrollView, TouchableOpacity, View } from "react-native";
import { Typography } from "./Typography";

interface SimpleGuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function SimpleGuestSelector({
  value,
  onChange,
  min = 1,
  max = 10,
  label = "Number of guests",
}: SimpleGuestSelectorProps) {
  const guestNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View>
      {label && (
        <Typography variant="body1" className="text-text-primary mb-3">
          {label}
        </Typography>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {guestNumbers.map((num) => {
            const isSelected = num === value;
            return (
              <TouchableOpacity
                key={num}
                onPress={() => onChange(num)}
                className={`w-12 h-12 rounded-xl border-2 items-center justify-center ${
                  isSelected
                    ? "bg-primary-500 border-primary-500"
                    : "bg-white border-neutral-300"
                }`}
                activeOpacity={0.7}
              >
                <Typography
                  variant="body1"
                  className={`font-medium ${
                    isSelected ? "text-white" : "text-text-primary"
                  }`}
                >
                  {num}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
