import {
  useSendLoginCode,
  useSendVerification,
  useVerifyAndRegister,
  useVerifyLoginCode,
} from "@/hooks/api/useAuth";
import { useToast } from "@/providers/ToastProvider";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../tokens";
import { CountrySelector, type Country } from "./CountrySelector";
import { LoadingSpinner } from "./LoadingSpinner";
import { RegistrationForm } from "./RegistrationForm";
import { SmsCodeInput } from "./SmsCodeInput";
import type { ToastType } from "./Toast";
import { Typography } from "./Typography";

interface AuthRequiredProps {
  onClose?: () => void;
}

interface LocalToast {
  type: ToastType;
  title: string;
  message?: string;
  visible: boolean;
}

export function AuthRequired({ onClose }: AuthRequiredProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCountrySelectorVisible, setIsCountrySelectorVisible] =
    useState(false);
  const [isSmsCodeVisible, setIsSmsCodeVisible] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [localToast, setLocalToast] = useState<LocalToast>({
    type: "error",
    title: "",
    message: "",
    visible: false,
  });
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    name: "Kazakhstan",
    code: "KZ",
    flag: "🇰🇿",
    dialCode: "+7",
  });

  // Animation refs for toast
  const toastTranslateY = useRef(new Animated.Value(100)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const sendVerificationMutation = useSendVerification();
  const sendLoginCodeMutation = useSendLoginCode();
  const verifyLoginCodeMutation = useVerifyLoginCode();
  const verifyAndRegisterMutation = useVerifyAndRegister();
  const { showSuccess, showWarning } = useToast();

  // Toast animation effect
  useEffect(() => {
    if (localToast.visible) {
      // Show animation - slide up from bottom
      Animated.parallel([
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        hideToastWithAnimation();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [localToast.visible]);

  const hideToastWithAnimation = () => {
    // Hide animation - slide down and fade out
    Animated.parallel([
      Animated.timing(toastTranslateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLocalToast((prev) => ({ ...prev, visible: false }));
    });
  };

  const showLocalToast = (type: ToastType, title: string, message?: string) => {
    setLocalToast({
      type,
      title,
      message,
      visible: true,
    });
  };

  const dismissLocalToast = () => {
    hideToastWithAnimation();
  };

  const handleLoginPress = () => {
    console.log("🚀 AuthRequired: handleLoginPress called:", {
      phoneNumber: phoneNumber.trim(),
      selectedCountry: selectedCountry.dialCode,
      isLoginMode,
      timestamp: new Date().toISOString(),
    });

    const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber.replace(
      /\s/g,
      ""
    )}`;

    console.log("📱 AuthRequired: Full phone number constructed:", {
      original: phoneNumber,
      fullPhoneNumber,
      isLoginMode,
      timestamp: new Date().toISOString(),
    });

    if (!phoneNumber.trim()) {
      console.warn("⚠️ AuthRequired: Empty phone number validation failed");
      showLocalToast("warning", "Ошибка", "Введите номер телефона");
      return;
    }

    if (isLoginMode) {
      // Login mode - send login SMS code
      console.log("📤 AuthRequired: Sending login SMS code:", {
        phoneNumber: fullPhoneNumber,
        timestamp: new Date().toISOString(),
      });

      sendLoginCodeMutation.mutate(
        { phone_number: fullPhoneNumber },
        {
          onSuccess: (result) => {
            console.log("✅ AuthRequired: Login SMS code sent successfully:", {
              result,
              timestamp: new Date().toISOString(),
            });
            setIsSmsCodeVisible(true);
          },
          onError: (error: any) => {
            console.error("❌ AuthRequired: Send login code error:", {
              error,
              phoneNumber: fullPhoneNumber,
              timestamp: new Date().toISOString(),
            });

            // Check for 404 status (user not found)
            if (error.response?.status === 404) {
              console.log(
                "👤 AuthRequired: User not found, switching to registration mode"
              );
              setIsLoginMode(false);
              showLocalToast(
                "warning",
                "Пользователь не найден",
                "Зарегистрируйтесь, чтобы продолжить"
              );
            } else {
              const errorMessage =
                error.response?.data?.message || "Ошибка отправки кода";
              showLocalToast("error", "Ошибка", errorMessage);
            }
          },
        }
      );
    } else {
      // Registration mode - send verification SMS code
      console.log("📤 AuthRequired: Sending verification request:", {
        phoneNumber: fullPhoneNumber,
        timestamp: new Date().toISOString(),
      });

      sendVerificationMutation.mutate(
        { phone_number: fullPhoneNumber },
        {
          onSuccess: (result) => {
            console.log("✅ AuthRequired: Verification sent successfully:", {
              result,
              timestamp: new Date().toISOString(),
            });
            setIsSmsCodeVisible(true);
          },
          onError: (error: any) => {
            console.error("❌ AuthRequired: Send verification error:", {
              error,
              phoneNumber: fullPhoneNumber,
              timestamp: new Date().toISOString(),
            });

            // Check for 409 status (user already exists)
            if (error.response?.status === 409) {
              console.log(
                "👤 AuthRequired: User already exists, switching to login mode"
              );
              setIsLoginMode(true);
              showLocalToast(
                "warning",
                "Аккаунт существует",
                "Войдите в существующий аккаунт"
              );
            } else {
              const errorMessage =
                error.response?.data?.message || "Ошибка отправки кода";
              showLocalToast("error", "Ошибка", errorMessage);
            }
          },
        }
      );
    }
  };

  const handleCountrySelect = (country: Country) => {
    console.log("🌍 AuthRequired: Country selected:", {
      country,
      timestamp: new Date().toISOString(),
    });
    setSelectedCountry(country);
    setIsCountrySelectorVisible(false);
  };

  const openCountrySelector = () => {
    console.log("🌍 AuthRequired: Opening country selector");
    Keyboard.dismiss();
    setIsCountrySelectorVisible(true);
  };

  const closeCountrySelector = () => {
    console.log("🌍 AuthRequired: Closing country selector");
    setIsCountrySelectorVisible(false);
  };

  const handleSmsVerify = (code: string) => {
    console.log("📱 AuthRequired: SMS Code received:", {
      code,
      isLoginMode,
      timestamp: new Date().toISOString(),
    });

    const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber.replace(
      /\s/g,
      ""
    )}`;

    if (isLoginMode) {
      // Login flow - verify login code
      verifyLoginCodeMutation.mutate(
        {
          phone_number: fullPhoneNumber,
          code: code.trim(),
        },
        {
          onSuccess: () => {
            console.log("✅ AuthRequired: Login successful");
            // Close SMS modal first, then close main modal
            setIsSmsCodeVisible(false);
            // Add small delay to ensure SMS modal closes first
            setTimeout(() => {
              onClose?.();
            }, 100);
          },
          onError: (error: any) => {
            console.error("❌ AuthRequired: Login error:", {
              error,
              timestamp: new Date().toISOString(),
            });

            const errorMessage =
              error.response?.data?.message || "Ошибка входа";
            showLocalToast("error", "Ошибка", errorMessage);
          },
        }
      );
    } else {
      // Registration flow - this should not be called directly anymore
      // The registration should go through RegistrationForm
      console.warn(
        "⚠️ AuthRequired: Direct registration call detected - this should go through RegistrationForm"
      );

      // Show registration form instead
      setShowRegistration(true);
    }
  };

  const handleSmsBack = () => {
    console.log("⬅️ AuthRequired: SMS back pressed");
    setIsSmsCodeVisible(false);
  };

  const handleSmsClose = () => {
    console.log("❌ AuthRequired: SMS close pressed");
    setIsSmsCodeVisible(false);
    // Don't close the main modal - let user try again or use back button
  };

  const dismissKeyboard = () => {
    console.log("⌨️ AuthRequired: Dismissing keyboard");
    Keyboard.dismiss();
  };

  const handleRegistrationBack = () => {
    setShowRegistration(false);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    setIsSmsCodeVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 100);
  };

  const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber.replace(
    /\s/g,
    ""
  )}`;
  const isLoading =
    sendVerificationMutation.isPending ||
    sendLoginCodeMutation.isPending ||
    verifyLoginCodeMutation.isPending ||
    verifyAndRegisterMutation.isPending;

  console.log("🔄 AuthRequired: Component state:", {
    phoneNumber,
    fullPhoneNumber,
    isLoading,
    isLoginMode,
    selectedCountry: selectedCountry.dialCode,
    timestamp: new Date().toISOString(),
  });

  return (
    <View className="w-full h-full bg-background-primary rounded-[20px] overflow-hidden">
      <SafeAreaView className="flex-1">
        {/* Header Title */}
        <View className="px-4 pt-[16px]">
          <View className="flex-row items-center justify-between">
            <Typography
              variant="subtitle1"
              className="text-black text-[17px] font-bold"
            >
              Авторизация
            </Typography>

            {onClose && (
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content - Wrapped with TouchableWithoutFeedback to dismiss keyboard */}
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="px-4 pt-[46px] flex-1 flex-col justify-between pb-8">
            {/* Top Section */}
            <View>
              {/* Subtitle */}
              <Typography
                variant="body1"
                className="text-black/60 text-[15px] font-medium mb-[22px]"
              >
                {isLoginMode
                  ? "Вам будет отправлен SMS-код для входа"
                  : "Введите номер телефона для регистрации"}
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
                    placeholder="*** *** ** **"
                    placeholderTextColor="#999"
                    className="flex-1 text-black text-base items-center font-normal h-full"
                    keyboardType="phone-pad"
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={dismissKeyboard}
                    blurOnSubmit={true}
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
                    disabled={isLoading}
                  >
                    <View className="w-[6.67px] h-[6.67px] bg-white rounded-full" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Switch between Registration and Login */}
              <TouchableOpacity
                className="mt-3"
                onPress={() => {
                  setIsLoginMode(!isLoginMode);
                }}
                disabled={isLoading}
              >
                <Typography className="text-primary-500 text-sm text-center">
                  {isLoginMode
                    ? "Нет аккаунта? Зарегистрироваться"
                    : "Есть аккаунт? Войти"}
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Bottom Section */}
            <View>
              {isLoading && (
                <View className="mb-4">
                  <LoadingSpinner
                    text={
                      isLoginMode
                        ? "Отправка кода для входа..."
                        : "Отправка кода регистрации..."
                    }
                  />
                </View>
              )}

              {/* SMS Code Button */}
              <TouchableOpacity
                className={`w-full h-[46px] rounded-xl items-center justify-center border ${
                  isLoading
                    ? "bg-background-cream border-neutral-300"
                    : "bg-white border-neutral-400"
                }`}
                onPress={handleLoginPress}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Typography
                  className={`text-base font-normal ${
                    isLoading ? "text-neutral-400" : "text-black"
                  }`}
                >
                  {isLoading
                    ? "Отправка..."
                    : isLoginMode
                    ? "Получить SMS-код для входа"
                    : "Получить SMS-код для регистрации"}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
          isLoginMode={isLoginMode}
        />
      </Modal>

      {/* Registration Form Modal */}
      <Modal
        visible={showRegistration}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleRegistrationBack}
      >
        <RegistrationForm
          phoneNumber={fullPhoneNumber}
          code="" // We won't have the code here since this is from AuthRequired
          onBack={handleRegistrationBack}
          onClose={onClose || (() => {})}
          onSuccess={handleRegistrationSuccess}
        />
      </Modal>

      {/* Local Toast inside modal */}
      {localToast.visible && (
        <Animated.View
          className="absolute bottom-20 left-4 right-4 z-50"
          style={{
            transform: [{ translateY: toastTranslateY }],
            opacity: toastOpacity,
          }}
        >
          <View className="bg-background-cream rounded-2xl shadow-xl border border-neutral-200 p-4">
            <View className="flex-row items-start">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  localToast.type === "error"
                    ? "bg-red-500"
                    : localToast.type === "warning"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              >
                <Ionicons
                  name={
                    localToast.type === "error"
                      ? "close-circle"
                      : localToast.type === "warning"
                      ? "warning"
                      : "checkmark-circle"
                  }
                  size={22}
                  color="white"
                />
              </View>
              <View className="flex-1">
                <Typography className="text-base font-semibold text-neutral-900 mb-1">
                  {localToast.title}
                </Typography>
                {localToast.message && (
                  <Typography className="text-sm text-neutral-600">
                    {localToast.message}
                  </Typography>
                )}
              </View>
              <TouchableOpacity
                className="ml-3 p-1"
                onPress={dismissLocalToast}
              >
                <Ionicons name="close" size={20} color={Colors.neutral[400]} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
