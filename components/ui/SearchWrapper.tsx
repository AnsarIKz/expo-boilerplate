import { Restaurant } from "@/entities/Restaurant";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { SearchOverlay } from "./SearchOverlay";

interface SearchWrapperProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  restaurants: Restaurant[];
  onRestaurantPress: (restaurantId: string) => void;
  onFocusChange?: (isFocused: boolean) => void;
}

export function SearchWrapper({
  placeholder,
  value,
  onChangeText,
  restaurants,
  onRestaurantPress,
  onFocusChange,
}: SearchWrapperProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    // Не закрываем сразу при blur, чтобы пользователь мог нажать на элемент overlay
    setTimeout(() => {
      setIsFocused(false);
      onFocusChange?.(false);
    }, 150);
  };

  const handleClear = () => {
    onChangeText("");
  };

  const handleFeaturePress = (feature: string) => {
    onChangeText(feature);
    setIsFocused(false);
    onFocusChange?.(false);
  };

  const handleRestaurantSelect = (restaurantId: string) => {
    setIsFocused(false);
    onFocusChange?.(false);
    onRestaurantPress(restaurantId);
  };

  const handleOverlayClose = () => {
    setIsFocused(false);
    onFocusChange?.(false);
  };

  return (
    <>
      <SearchBar
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        showClearButton={isFocused}
        onClear={handleClear}
        autoFocus={false}
      />

      {isFocused && (
        <SearchOverlay
          searchText={value}
          restaurants={restaurants}
          onRestaurantPress={handleRestaurantSelect}
          onFeaturePress={handleFeaturePress}
          onClose={handleOverlayClose}
        />
      )}
    </>
  );
}
