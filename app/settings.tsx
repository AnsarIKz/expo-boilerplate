import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, ScrollView, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/components/tokens";
import { Card } from "@/components/ui/Card";
import { TitleHeader } from "@/components/ui/TitleHeader";
import { Typography } from "@/components/ui/Typography";
import { useAuthStore } from "@/stores/authStore";

// Компонент для пункта настроек
const SettingItem = ({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  type = "text",
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: boolean | string;
  onValueChange?: (value: boolean) => void;
  type?: "switch" | "text" | "action";
  disabled?: boolean;
}) => (
  <Card variant="ghost" padding="md" className="mb-3 mx-4">
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
        <Ionicons
          name={icon}
          size={20}
          color={disabled ? Colors.neutral[400] : Colors.primary[500]}
        />
      </View>

      <View className="flex-1">
        <Typography
          variant="subtitle1"
          className={disabled ? "text-neutral-400" : "text-text-primary"}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="secondary">
            {subtitle}
          </Typography>
        )}
      </View>

      {type === "switch" && (
        <Switch
          value={value as boolean}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: Colors.neutral[300], true: Colors.primary[200] }}
          thumbColor={value ? Colors.primary[500] : Colors.neutral[500]}
        />
      )}

      {type === "text" && value && (
        <Typography variant="body2" color="secondary">
          {value}
        </Typography>
      )}

      {type === "action" && !disabled && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.neutral[400]}
        />
      )}
    </View>
  </Card>
);

// Настройки для неавторизованного пользователя
const AnonymousSettings = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLanguage = () => {
    Alert.alert("Язык", "Выберите язык интерфейса", [
      { text: "Русский", onPress: () => console.log("Russian selected") },
      { text: "English", onPress: () => console.log("English selected") },
      { text: "Отмена", style: "cancel" },
    ]);
  };

  return (
    <View className="px-4">
      {/* Основные настройки */}
      <View className="mb-6">
        <Typography variant="h6" className="text-text-primary mx-4 mb-3">
          Основные настройки
        </Typography>

        <SettingItem
          icon="notifications-outline"
          title="Уведомления"
          subtitle="Основные уведомления приложения"
          type="switch"
          value={notifications}
          onValueChange={setNotifications}
        />

        <SettingItem
          icon="moon-outline"
          title="Темная тема"
          subtitle="Переключение темы интерфейса"
          type="switch"
          value={darkMode}
          onValueChange={setDarkMode}
        />

        <SettingItem
          icon="language-outline"
          title="Язык"
          subtitle="Русский"
          type="action"
          onValueChange={() => handleLanguage()}
        />
      </View>

      {/* Недоступные настройки */}
      <View className="mb-6">
        <Typography variant="h6" className="text-text-primary mx-4 mb-3">
          Требуют авторизации
        </Typography>

        <SettingItem
          icon="person-outline"
          title="Профиль"
          subtitle="Недоступно без авторизации"
          type="action"
          disabled
        />

        <SettingItem
          icon="card-outline"
          title="Способы оплаты"
          subtitle="Недоступно без авторизации"
          type="action"
          disabled
        />
      </View>

      {/* Информационная карточка */}
      <Card variant="ghost" padding="md" className="mx-4">
        <View className="items-center">
          <Ionicons
            name="information-circle-outline"
            size={32}
            color={Colors.primary[500]}
            className="mb-3"
          />
          <Typography
            variant="subtitle1"
            className="text-text-primary mb-2"
            align="center"
          >
            Ограниченные возможности
          </Typography>
          <Typography variant="body2" color="secondary" align="center">
            Авторизуйтесь для получения доступа ко всем настройкам
          </Typography>
        </View>
      </Card>
    </View>
  );
};

// Настройки для авторизованного пользователя
const AuthenticatedSettings = () => {
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const handleLanguage = () => {
    Alert.alert("Язык", "Выберите язык интерфейса", [
      { text: "Русский", onPress: () => console.log("Russian selected") },
      { text: "English", onPress: () => console.log("English selected") },
      { text: "Отмена", style: "cancel" },
    ]);
  };

  const handleCurrency = () => {
    Alert.alert("Валюта", "Выберите валюту", [
      { text: "RUB", onPress: () => console.log("RUB selected") },
      { text: "USD", onPress: () => console.log("USD selected") },
      { text: "EUR", onPress: () => console.log("EUR selected") },
      { text: "Отмена", style: "cancel" },
    ]);
  };

  const handlePrivacy = () => {
    console.log("Privacy settings");
  };

  const handlePaymentMethods = () => {
    console.log("Payment methods");
  };

  const handleExportData = () => {
    Alert.alert(
      "Экспорт данных",
      "Ваши данные будут отправлены на указанный email",
      [
        { text: "Отмена", style: "cancel" },
        { text: "Экспортировать", onPress: () => console.log("Export data") },
      ]
    );
  };

  return (
    <View>
      {/* Уведомления */}
      <View className="mb-6">
        <Typography variant="h6" className="text-text-primary mx-4 mb-3">
          Уведомления
        </Typography>

        <SettingItem
          icon="notifications-outline"
          title="Уведомления"
          subtitle="Основные уведомления приложения"
          type="switch"
          value={notifications}
          onValueChange={setNotifications}
        />

        <SettingItem
          icon="phone-portrait-outline"
          title="Push-уведомления"
          subtitle="Уведомления на устройство"
          type="switch"
          value={pushNotifications}
          onValueChange={setPushNotifications}
        />

        <SettingItem
          icon="mail-outline"
          title="Email-уведомления"
          subtitle="Уведомления на почту"
          type="switch"
          value={emailNotifications}
          onValueChange={setEmailNotifications}
        />
      </View>

      {/* Персонализация */}
      <View className="mb-6">
        <Typography variant="h6" className="text-text-primary mx-4 mb-3">
          Персонализация
        </Typography>

        <SettingItem
          icon="moon-outline"
          title="Темная тема"
          subtitle="Переключение темы интерфейса"
          type="switch"
          value={darkMode}
          onValueChange={setDarkMode}
        />

        <SettingItem
          icon="language-outline"
          title="Язык"
          subtitle="Русский"
          type="action"
          onValueChange={() => handleLanguage()}
        />

        <SettingItem
          icon="cash-outline"
          title="Валюта"
          subtitle="RUB"
          type="action"
          onValueChange={() => handleCurrency()}
        />
      </View>

      {/* Безопасность */}
      <View className="mb-6">
        <Typography variant="h6" className="text-text-primary mx-4 mb-3">
          Безопасность
        </Typography>

        <SettingItem
          icon="finger-print-outline"
          title="Биометрическая аутентификация"
          subtitle="Вход по отпечатку пальца или Face ID"
          type="switch"
          value={biometric}
          onValueChange={setBiometric}
        />

        <SettingItem
          icon="shield-outline"
          title="Конфиденциальность"
          subtitle="Настройки приватности данных"
          type="action"
          onValueChange={() => handlePrivacy()}
        />
      </View>

      {/* Аккаунт */}
      <View className="mb-6">
        <Typography variant="h6" className="text-text-primary mx-4 mb-3">
          Аккаунт
        </Typography>

        <SettingItem
          icon="card-outline"
          title="Способы оплаты"
          subtitle="Управление картами и платежами"
          type="action"
          onValueChange={() => handlePaymentMethods()}
        />

        <SettingItem
          icon="sync-outline"
          title="Автосинхронизация"
          subtitle="Синхронизация данных между устройствами"
          type="switch"
          value={autoSync}
          onValueChange={setAutoSync}
        />

        <SettingItem
          icon="download-outline"
          title="Экспорт данных"
          subtitle="Скачать копию ваших данных"
          type="action"
          onValueChange={() => handleExportData()}
        />
      </View>
    </View>
  );
};

export default function SettingsScreen() {
  const { isAuthenticated } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <TitleHeader title="Настройки" showBackButton />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
      >
        {isAuthenticated ? <AuthenticatedSettings /> : <AnonymousSettings />}
      </ScrollView>
    </SafeAreaView>
  );
}
