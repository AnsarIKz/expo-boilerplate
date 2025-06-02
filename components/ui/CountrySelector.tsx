import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchBar } from "./SearchBar";
import { Typography } from "./Typography";

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

interface CountrySelectorProps {
  onSelect: (country: Country) => void;
  onClose: () => void;
  selectedCountry?: Country;
}

const countries: Country[] = [
  { name: "Afghanistan", code: "AF", flag: "🇦🇫", dialCode: "+93" },
  { name: "Albania", code: "AL", flag: "🇦🇱", dialCode: "+355" },
  { name: "Algeria", code: "DZ", flag: "🇩🇿", dialCode: "+213" },
  { name: "Andorra", code: "AD", flag: "🇦🇩", dialCode: "+376" },
  { name: "Angola", code: "AO", flag: "🇦🇴", dialCode: "+244" },
  { name: "Antigua and Barbuda", code: "AG", flag: "🇦🇬", dialCode: "+1-268" },
  { name: "Argentina", code: "AR", flag: "🇦🇷", dialCode: "+54" },
  { name: "Armenia", code: "AM", flag: "🇦🇲", dialCode: "+374" },
  { name: "Australia", code: "AU", flag: "🇦🇺", dialCode: "+61" },
  { name: "Austria", code: "AT", flag: "🇦🇹", dialCode: "+43" },
  { name: "Azerbaijan", code: "AZ", flag: "🇦🇿", dialCode: "+994" },
  { name: "Bahamas", code: "BS", flag: "🇧🇸", dialCode: "+1-242" },
  { name: "Bahrain", code: "BH", flag: "🇧🇭", dialCode: "+973" },
  { name: "Barbados", code: "BB", flag: "🇧🇧", dialCode: "+1-246" },
  { name: "Belarus", code: "BY", flag: "🇧🇾", dialCode: "+375" },
  { name: "Belgium", code: "BE", flag: "🇧🇪", dialCode: "+32" },
  { name: "Brazil", code: "BR", flag: "🇧🇷", dialCode: "+55" },
  { name: "Canada", code: "CA", flag: "🇨🇦", dialCode: "+1" },
  { name: "China", code: "CN", flag: "🇨🇳", dialCode: "+86" },
  { name: "France", code: "FR", flag: "🇫🇷", dialCode: "+33" },
  { name: "Germany", code: "DE", flag: "🇩🇪", dialCode: "+49" },
  { name: "India", code: "IN", flag: "🇮🇳", dialCode: "+91" },
  { name: "Italy", code: "IT", flag: "🇮🇹", dialCode: "+39" },
  { name: "Japan", code: "JP", flag: "🇯🇵", dialCode: "+81" },
  { name: "Kazakhstan", code: "KZ", flag: "🇰🇿", dialCode: "+77" },
  { name: "Russia", code: "RU", flag: "🇷🇺", dialCode: "+7" },
  { name: "South Korea", code: "KR", flag: "🇰🇷", dialCode: "+82" },
  { name: "Spain", code: "ES", flag: "🇪🇸", dialCode: "+34" },
  { name: "Turkey", code: "TR", flag: "🇹🇷", dialCode: "+90" },
  { name: "Ukraine", code: "UA", flag: "🇺🇦", dialCode: "+380" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", dialCode: "+44" },
  { name: "United States", code: "US", flag: "🇺🇸", dialCode: "+1" },
];

export function CountrySelector({
  onSelect,
  onClose,
  selectedCountry,
}: CountrySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 border-b border-neutral-200"
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      {/* Flag */}
      <View className="w-8 h-6 mr-3 items-center justify-center">
        <Typography className="text-lg">{item.flag}</Typography>
      </View>

      {/* Country Name */}
      <View className="flex-1">
        <Typography className="text-black text-base font-normal">
          {item.name}
        </Typography>
      </View>

      {/* Dial Code */}
      <Typography className="text-neutral-500 text-base font-normal">
        {item.dialCode}
      </Typography>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background-primary">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-neutral-200">
          {/* Back Button */}
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 items-center justify-center mr-3"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* Title */}
          <View className="flex-1">
            <Typography className="text-black text-lg font-medium">
              Phone code
            </Typography>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar
          placeholder="Search for country, code"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Countries List */}
        <FlatList
          data={filteredCountries}
          renderItem={renderCountryItem}
          keyExtractor={(item) => item.code}
          showsVerticalScrollIndicator={false}
          className="flex-1"
        />
      </SafeAreaView>
    </View>
  );
}

export { type Country };
