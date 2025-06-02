import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/components/tokens";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Body, Heading1, Typography } from "@/components/ui/Typography";
import { useAuthStore } from "@/stores/authStore";

const AUTH_API_BASE = "http://localhost:3000/auth"; // Change to your backend URL

export default function AuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+77");

  const { login, setLoading } = useAuthStore();

  const handleRequestCode = async () => {
    if (!phoneNumber) {
      Alert.alert("Ошибка", "Введите номер телефона");
      return;
    }

    const fullPhoneNumber = selectedCountryCode + phoneNumber;
    setIsLoading(true);
    setLoading(true);

    try {
      const response = await fetch(`${AUTH_API_BASE}/phone/request-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCodeSent(true);
        Alert.alert("Успешно", "Код отправлен на ваш номер");
      } else {
        Alert.alert("Ошибка", data.message || "Не удалось отправить код");
      }
    } catch (error) {
      Alert.alert("Ошибка", "Проблемы с подключением к серверу");
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert("Ошибка", "Введите код подтверждения");
      return;
    }

    const fullPhoneNumber = selectedCountryCode + phoneNumber;
    setIsLoading(true);
    setLoading(true);

    try {
      const response = await fetch(`${AUTH_API_BASE}/phone/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Успешная авторизация - сохраняем данные пользователя
        const user = {
          id: data.user?.id || "1",
          phoneNumber: fullPhoneNumber,
          name: data.user?.name,
          email: data.user?.email,
        };

        const token = data.token || "mock_token";

        // Сохраняем в store
        login(user, token);

        Alert.alert("Успешно", "Вы вошли в систему");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Ошибка", data.message || "Неверный код");
      }
    } catch (error) {
      // В случае ошибки API, делаем мок авторизацию для демо
      console.log("API недоступен, выполняем мок авторизацию");

      const mockUser = {
        id: "mock_user_1",
        phoneNumber: fullPhoneNumber,
        name: "Пользователь",
        email: "user@example.com",
      };

      const mockToken = "mock_jwt_token";

      // Сохраняем в store
      login(mockUser, mockToken);

      Alert.alert("Успешно", "Вы вошли в систему");
      router.replace("/(tabs)");
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Decorative background elements */}
        <View className="absolute top-10 right-8 w-40 h-40 bg-primary-100 rounded-full opacity-30" />
        <View className="absolute top-32 left-4 w-24 h-24 bg-warning-light rounded-full opacity-20" />
        <View className="absolute bottom-20 right-12 w-32 h-32 bg-info-light rounded-full opacity-25" />

        <View className="flex-1 px-6 pt-16">
          {/* Header */}
          <View className="items-center mb-12">
            {/* App Icon */}
            <View className="w-20 h-20 bg-primary-500 rounded-2xl items-center justify-center mb-6 shadow-lg">
              <Ionicons name="restaurant" size={32} color="white" />
            </View>

            <Heading1 className="text-center mb-3">
              {!isCodeSent ? "Добро пожаловать!" : "Введите код"}
            </Heading1>

            <Typography
              variant="body1"
              color="secondary"
              className="text-center max-w-sm"
            >
              {!isCodeSent
                ? "Найдите лучшие рестораны в вашем городе"
                : "Мы отправили код подтверждения на ваш номер"}
            </Typography>
          </View>

          {/* Form Card */}
          <Card variant="elevated" padding="lg" className="mb-8 shadow-xl">
            {!isCodeSent ? (
              <View>
                <Typography variant="subtitle1" className="mb-6 text-center">
                  Введите номер телефона для входа
                </Typography>

                <View className="flex-row items-center mb-6">
                  <View className="flex-row items-center px-4 py-4 bg-neutral-50 rounded-xl mr-3 border border-neutral-200">
                    <Typography variant="body1" className="mr-2 text-lg">
                      🇰🇿
                    </Typography>
                    <Typography variant="subtitle1" className="font-medium">
                      {selectedCountryCode}
                    </Typography>
                  </View>

                  <View className="flex-1">
                    <Input
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="00 101 61 10"
                      keyboardType="phone-pad"
                      maxLength={11}
                      variant="outline"
                      className="text-lg py-4"
                    />
                  </View>
                </View>

                {/* Benefits */}
                <View className="space-y-3 mb-6">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.success.main}
                    />
                    <Typography
                      variant="body2"
                      color="secondary"
                      className="ml-3"
                    >
                      Быстрая авторизация по SMS
                    </Typography>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons
                      name="shield-checkmark"
                      size={20}
                      color={Colors.success.main}
                    />
                    <Typography
                      variant="body2"
                      color="secondary"
                      className="ml-3"
                    >
                      Безопасность ваших данных
                    </Typography>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons
                      name="heart"
                      size={20}
                      color={Colors.error.main}
                    />
                    <Typography
                      variant="body2"
                      color="secondary"
                      className="ml-3"
                    >
                      Персональные рекомендации
                    </Typography>
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <View className="items-center mb-6">
                  <View className="w-16 h-16 bg-primary-50 rounded-full items-center justify-center mb-4">
                    <Ionicons
                      name="chatbubbles"
                      size={28}
                      color={Colors.primary[500]}
                    />
                  </View>
                  <Typography variant="subtitle1" className="mb-2 text-center">
                    Проверьте SMS
                  </Typography>
                  <Body color="secondary" className="text-center">
                    Код отправлен на номер{"\n"}
                    <Typography variant="subtitle2" className="font-medium">
                      {selectedCountryCode} {phoneNumber}
                    </Typography>
                  </Body>
                </View>

                <Input
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="Введите 6-значный код"
                  keyboardType="number-pad"
                  maxLength={6}
                  variant="outline"
                  className="text-center text-2xl font-medium py-4 mb-4"
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setIsCodeSent(false)}
                  className="self-center"
                >
                  <Typography variant="body2" className="text-primary-500">
                    Изменить номер телефона
                  </Typography>
                </Button>
              </View>
            )}
          </Card>

          {/* Action Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={!isCodeSent ? handleRequestCode : handleVerifyCode}
            loading={isLoading}
            className="mb-8 shadow-md"
          >
            <View className="flex-row items-center">
              <Ionicons
                name={!isCodeSent ? "paper-plane" : "checkmark-circle"}
                size={20}
                color="white"
              />
              <Typography variant="subtitle1" className="text-white ml-2">
                {!isCodeSent ? "Получить код" : "Войти"}
              </Typography>
            </View>
          </Button>

          {/* Terms */}
          <View className="items-center px-4 pb-8">
            <Body color="secondary" className="text-center leading-6 text-sm">
              Продолжая, вы соглашаетесь с{" "}
              <Typography variant="body2" className="text-primary-500">
                Условиями использования
              </Typography>{" "}
              и{" "}
              <Typography variant="body2" className="text-primary-500">
                Политикой конфиденциальности
              </Typography>
            </Body>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
