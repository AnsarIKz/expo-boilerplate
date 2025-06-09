import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StatusBar, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CityCard } from "@/components/ui/CityCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { Typography } from "@/components/ui/Typography";
import { City } from "@/hooks/useSelectedCity";
import { useCityContext } from "@/providers/CityProvider";

// Список городов Казахстана
const KAZAKHSTAN_CITIES = [
  { id: "1", name: "Алматы", region: "Алматинская область" },
  { id: "2", name: "Астана", region: "г. Астана" },
  { id: "3", name: "Шымкент", region: "Туркестанская область" },
  { id: "4", name: "Караганда", region: "Карагандинская область" },
  { id: "5", name: "Актобе", region: "Актюбинская область" },
  { id: "6", name: "Тараз", region: "Жамбылская область" },
  { id: "7", name: "Павлодар", region: "Павлодарская область" },
  {
    id: "8",
    name: "Усть-Каменогорск",
    region: "Восточно-Казахстанская область",
  },
  { id: "9", name: "Семей", region: "Восточно-Казахстанская область" },
  { id: "10", name: "Атырау", region: "Атырауская область" },
  { id: "11", name: "Костанай", region: "Костанайская область" },
  { id: "12", name: "Кызылорда", region: "Кызылординская область" },
  { id: "13", name: "Уральск", region: "Западно-Казахстанская область" },
  { id: "14", name: "Петропавловск", region: "Северо-Казахстанская область" },
  { id: "15", name: "Актау", region: "Мангистауская область" },
  { id: "16", name: "Темиртау", region: "Карагандинская область" },
  { id: "17", name: "Туркестан", region: "Туркестанская область" },
  { id: "18", name: "Кокшетау", region: "Акмолинская область" },
  { id: "19", name: "Талдыкорган", region: "Алматинская область" },
  { id: "20", name: "Экибастуз", region: "Павлодарская область" },
];

export default function CitySelectorScreen() {
  const [searchText, setSearchText] = useState("");
  const { selectedCity, updateSelectedCity } = useCityContext();

  // Фильтрация городов по поиску
  const filteredCities = KAZAKHSTAN_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(searchText.toLowerCase()) ||
      city.region.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCitySelect = useCallback(
    (city: City) => {
      updateSelectedCity(city);
      router.back();
    },
    [updateSelectedCity]
  );

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
  }, []);

  const renderCity = useCallback(
    ({ item: city }: { item: City }) => (
      <CityCard
        city={city}
        isSelected={selectedCity.id === city.id}
        onPress={handleCitySelect}
      />
    ),
    [handleCitySelect, selectedCity.id]
  );

  return (
    <SafeAreaView className="flex-1 bg-background-cream">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-neutral-100">
        <TouchableOpacity
          onPress={handleClose}
          className="w-8 h-8 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#000000" />
        </TouchableOpacity>
        <Typography variant="body1" className="font-semibold">
          Выберите город
        </Typography>
        <View className="w-8" />
      </View>

      {/* Search */}
      <View className="py-3">
        <SearchBar
          placeholder="Поиск города..."
          value={searchText}
          onChangeText={setSearchText}
          onClear={handleClearSearch}
        />
      </View>

      {/* Cities List */}
      <FlatList
        data={filteredCities}
        renderItem={renderCity}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      />
    </SafeAreaView>
  );
}
