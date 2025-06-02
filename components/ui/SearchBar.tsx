import { Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showClearButton?: boolean;
  onClear?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  showClearButton = true,
  onClear,
  autoFocus = false,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-white rounded-xl border border-neutral-400 px-4 py-3 mx-4 h-[46px] shadow-sm">
      <Ionicons name="search" size={20} color="#a5a5a5" />
      <TextInput
        className="flex-1 text-[15px] font-sf-pro text-text-primary ml-3"
        placeholder={placeholder}
        placeholderTextColor="#a5a5a5"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
      />
      {showClearButton && value.length > 0 && (
        <TouchableOpacity onPress={onClear} className="ml-2">
          <Ionicons name="close-circle" size={20} color="#a5a5a5" />
        </TouchableOpacity>
      )}
    </View>
  );
}
