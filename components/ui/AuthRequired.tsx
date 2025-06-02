import { useState } from "react";
import {
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CountrySelector, type Country } from "./CountrySelector";
import { SmsCodeInput } from "./SmsCodeInput";
import { Typography } from "./Typography";

export function AuthRequired() {
  const [phoneNumber, setPhoneNumber] = useState("00 101 61 10");
  const [isCountrySelectorVisible, setIsCountrySelectorVisible] =
    useState(false);
  const [isSmsCodeVisible, setIsSmsCodeVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    name: "Kazakhstan",
    code: "KZ",
    flag: "🇰🇿",
    dialCode: "+77",
  });

  const handleLoginPress = () => {
    // Показываем экран ввода SMS кода
    setIsSmsCodeVisible(true);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsCountrySelectorVisible(false);
  };

  const openCountrySelector = () => {
    setIsCountrySelectorVisible(true);
  };

  const closeCountrySelector = () => {
    setIsCountrySelectorVisible(false);
  };

  const handleSmsVerify = (code: string) => {
    console.log("SMS Code:", code);
    // Здесь будет логика верификации
    setIsSmsCodeVisible(false);
  };

  const handleSmsBack = () => {
    setIsSmsCodeVisible(false);
  };

  const handleSmsClose = () => {
    setIsSmsCodeVisible(false);
  };

  const fullPhoneNumber = `${selectedCountry.dialCode} ${phoneNumber}`;

  return (
    <View className="w-full h-full bg-background-primary rounded-[20px] overflow-hidden">
      <SafeAreaView className="flex-1">
        {/* Header Title */}
        <View className="px-4 pt-[16px]">
          <Typography
            variant="subtitle1"
            className="text-black text-[17px] font-bold"
          >
            Авторизация
          </Typography>
        </View>

        {/* Content */}
        <View className="px-4 pt-[46px] flex-1 flex-col justify-between pb-8">
          {/* Top Section */}
          <View>
            {/* Subtitle */}
            <Typography
              variant="body1"
              className="text-black/60 text-[15px] font-medium mb-[22px]"
            >
              Введите номер телефона
            </Typography>

            {/* Phone Input */}
            <View className="w-full h-[46px] rounded-xl border border-[#4d4d4d] flex-row">
              {/* Country Code Section - Clickable */}
              <TouchableWithoutFeedback onPress={openCountrySelector}>
                <View className="w-[90px] h-[46px] rounded-tl-xl rounded-bl-xl border-r border-[#4d4d4d] flex-row items-center justify-center">
                  {/* Country Flag */}
                  <View className="w-8 h-6 mr-2 items-center justify-center">
                    <Typography className="text-lg">
                      {selectedCountry.flag}
                    </Typography>
                  </View>
                  <Typography className="text-black text-base font-normal">
                    {selectedCountry.dialCode}
                  </Typography>
                </View>
              </TouchableWithoutFeedback>

              {/* Phone Number Input */}
              <View className="flex-1 flex-row items-center px-4">
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="** *** ** **"
                  placeholderTextColor="#999"
                  className="flex-1 text-black text-base items-center font-normal h-full"
                  keyboardType="phone-pad"
                  style={{
                    fontSize: 16,
                    color: "#000000",
                    fontFamily: "SF_Pro_Text",
                    textAlignVertical: "center",
                  }}
                />

                {/* Clear Button */}
                <TouchableOpacity
                  className="w-5 h-5 bg-[#a5a5a5] rounded-full items-center justify-center"
                  onPress={() => setPhoneNumber("")}
                >
                  <View className="w-[6.67px] h-[6.67px] bg-white rounded-full" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bottom Section */}
          <View>
            {/* Login Button */}
            <TouchableOpacity
              className="w-full h-[46px] bg-white rounded-xl items-center justify-center border border-neutral-400"
              onPress={handleLoginPress}
              activeOpacity={0.8}
            >
              <Typography className="text-black text-base font-normal">
                Войти
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Country Selector Modal */}
      <Modal
        visible={isCountrySelectorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCountrySelector}
      >
        <CountrySelector
          onSelect={handleCountrySelect}
          onClose={closeCountrySelector}
          selectedCountry={selectedCountry}
        />
      </Modal>

      {/* SMS Code Input Modal */}
      <Modal
        visible={isSmsCodeVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleSmsClose}
      >
        <SmsCodeInput
          phoneNumber={fullPhoneNumber}
          onVerify={handleSmsVerify}
          onBack={handleSmsBack}
          onClose={handleSmsClose}
        />
      </Modal>
    </View>
  );
}
