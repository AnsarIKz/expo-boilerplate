import { FilterChip } from "@/types/restaurant";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity } from "react-native";

interface FilterChipsProps {
  chips: FilterChip[];
  onChipPress: (chipId: string) => void;
  onFilterPress: () => void;
}

export function FilterChips({
  chips,
  onChipPress,
  onFilterPress,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-[14px]"
      contentContainerStyle={{ gap: 8, paddingRight: 14 }}
    >
      {/* Filter Button */}
      <TouchableOpacity
        className="flex-row items-center justify-center bg-primary-500 px-4 rounded-[10px] h-[42px]"
        onPress={onFilterPress}
      >
        <Ionicons name="options" size={16} color="white" />
        <Text className="text-white text-[15px] font-sf-pro ml-2">Фильтр</Text>
      </TouchableOpacity>

      {/* Category Chips */}
      {chips.map((chip) => (
        <TouchableOpacity
          key={chip.id}
          className={`px-4 rounded-[10px] border h-[42px] justify-center items-center ${
            chip.isSelected
              ? "bg-primary-500 border-primary-500"
              : "bg-white border-neutral-400"
          }`}
          onPress={() => onChipPress(chip.id)}
        >
          <Text
            className={`text-[15px] font-sf-pro ${
              chip.isSelected ? "text-white" : "text-neutral-900"
            }`}
          >
            {chip.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
