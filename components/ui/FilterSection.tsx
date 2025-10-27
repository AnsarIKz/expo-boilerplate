import { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { Typography } from "./Typography";

interface FilterOption {
  id: string;
  label: string;
  isSelected: boolean;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  onOptionToggle: (id: string) => void;
  multiSelect?: boolean;
  isLoading?: boolean;
}

export function FilterSection({
  title,
  options,
  onOptionToggle,
  multiSelect = true,
  isLoading = false,
}: FilterSectionProps) {
  const handleOptionPress = useCallback(
    (id: string) => {
      onOptionToggle(id);
    },
    [onOptionToggle]
  );

  return (
    <View className="px-4 py-4">
      <Typography variant="h6" className="font-semibold mb-2">
        {title}
      </Typography>

      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            className={`px-3 py-2 rounded-full border ${
              option.isSelected
                ? "bg-primary-500 border-primary-500"
                : "bg-white border-neutral-300"
            }`}
            onPress={() => handleOptionPress(option.id)}
            activeOpacity={0.7}
          >
            <Typography
              variant="caption"
              color={option.isSelected ? "inverse" : "primary"}
              className={`font-medium ${
                option.isSelected ? "text-white" : "text-text-primary"
              }`}
            >
              {option.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
