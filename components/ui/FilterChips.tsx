import { FilterChip } from "@/types/restaurant";
import { ScrollView } from "react-native";
import { Chip } from "./Chip";

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
      <Chip
        label="Фильтр"
        variant="filter"
        icon="options"
        onPress={onFilterPress}
      />

      {/* Category Chips */}
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          label={chip.label}
          isSelected={chip.isSelected}
          onPress={() => onChipPress(chip.id)}
        />
      ))}
    </ScrollView>
  );
}
