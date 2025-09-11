import { useVerifyAndRegister } from "@/hooks/api/useAuth";
import { useToast } from "@/providers/ToastProvider";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./Button";
import { Input } from "./Input";
import { LoadingSpinner } from "./LoadingSpinner";
import { Typography } from "./Typography";

interface RegistrationFormProps {
  phoneNumber: string;
  code: string;
  onBack: () => void;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RegistrationForm({
  phoneNumber,
  code,
  onBack,
  onClose,
  onSuccess,
}: RegistrationFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const verifyAndRegisterMutation = useVerifyAndRegister();
  const { showSuccess, showWarning } = useToast();

  const handleRegister = async () => {
    // Prevent multiple submissions
    if (verifyAndRegisterMutation.isPending) {
      console.log(
        "⏳ Registration already in progress, ignoring duplicate call"
      );
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !password.trim()) {
      showWarning("Ошибка", "Заполните все поля");
      return;
    }

    if (password !== confirmPassword) {
      showWarning("Ошибка", "Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      showWarning("Ошибка", "Пароль должен содержать минимум 6 символов");
      return;
    }

    try {
      console.log("🚀 RegistrationForm: Starting registration:", {
        phoneNumber,
        code,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        timestamp: new Date().toISOString(),
      });

      await verifyAndRegisterMutation.mutateAsync({
        phone_number: phoneNumber,
        code,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password: password.trim(),
      });

      console.log("✅ RegistrationForm: Registration completed successfully");

      // Success notification is handled in the hook

      // Call success callback immediately and close
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("❌ RegistrationForm: Registration error:", error);
      // Error notifications are now handled in the hook
    }
  };

  const isLoading = verifyAndRegisterMutation.isPending;
  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    password === confirmPassword;

  return (
    <View className="flex-1 bg-background-primary">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-neutral-200">
          {/* Back Button */}
          <TouchableOpacity
            onPress={onBack}
            className="w-8 h-8 items-center justify-center mr-3"
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* Title */}
          <View className="flex-1">
            <Typography className="text-black text-lg font-medium">
              Регистрация
            </Typography>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 items-center justify-center"
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 px-4 pt-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Description */}
          <View className="mb-6">
            <Typography className="text-neutral-600 text-base leading-relaxed">
              Код подтвержден! Теперь заполните информацию о себе для завершения
              регистрации.
            </Typography>
          </View>

          {/* Form Fields */}
          <View className="space-y-4 mb-8">
            {/* First Name */}
            <View>
              <Typography className="text-black text-sm font-medium mb-2">
                Имя
              </Typography>
              <Input
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Введите ваше имя"
                disabled={isLoading}
                leftIcon="person-outline"
              />
            </View>

            {/* Last Name */}
            <View>
              <Typography className="text-black text-sm font-medium mb-2">
                Фамилия
              </Typography>
              <Input
                value={lastName}
                onChangeText={setLastName}
                placeholder="Введите вашу фамилию"
                disabled={isLoading}
                leftIcon="person-outline"
              />
            </View>

            {/* Password */}
            <View>
              <Typography className="text-black text-sm font-medium mb-2">
                Пароль
              </Typography>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Минимум 6 символов"
                secureTextEntry
                disabled={isLoading}
                leftIcon="lock-closed-outline"
              />
            </View>

            {/* Confirm Password */}
            <View>
              <Typography className="text-black text-sm font-medium mb-2">
                Подтвердите пароль
              </Typography>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Повторите пароль"
                secureTextEntry
                disabled={isLoading}
                leftIcon="lock-closed-outline"
              />
            </View>
          </View>

          {/* Loading */}
          {isLoading && (
            <View className="mb-6">
              <LoadingSpinner text="Создание аккаунта..." />
            </View>
          )}

          {/* Register Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleRegister}
            disabled={!isFormValid}
            loading={isLoading}
            className="mb-6"
          >
            Зарегистрироваться
          </Button>

          {/* Terms */}
          <View className="items-center px-4 mb-8">
            <Typography className="text-neutral-500 text-xs text-center leading-relaxed">
              Нажимая "Зарегистрироваться", вы соглашаетесь с{" "}
              <Typography className="text-primary-500 text-xs underline">
                Условиями использования
              </Typography>{" "}
              и{" "}
              <Typography className="text-primary-500 text-xs underline">
                Политикой конфиденциальности
              </Typography>
            </Typography>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
