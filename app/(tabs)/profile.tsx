import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/components/tokens";
import { AuthRequired } from "@/components/ui/AuthRequired";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useAuthStore } from "@/stores/authStore";

// Компонент для пункта меню профиля
const ProfileMenuItem = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}) => (
  <Card variant="outlined" padding="md" onPress={onPress} className="mb-3 mx-4">
    <View className="flex-row items-center">
      <View className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color={Colors.primary[500]} />
      </View>

      <View className="flex-1">
        <Typography variant="subtitle1" className="text-text-primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="secondary">
            {subtitle}
          </Typography>
        )}
      </View>

      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.neutral[400]}
        />
      )}
    </View>
  </Card>
);

export default function ProfileScreen() {
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Выход", "Вы уверены, что хотите выйти из аккаунта?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Выйти",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    console.log("Edit profile");
  };

  const handleSettings = () => {
    console.log("Settings");
  };

  const handleSupport = () => {
    console.log("Support");
  };

  const handleAbout = () => {
    console.log("About");
  };

  // Если пользователь не авторизован, показываем AuthRequired
  if (!isAuthenticated) {
    return <AuthRequired />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="px-4 pt-2 pb-6">
          <Typography variant="h4" className="text-text-primary">
            Профиль
          </Typography>
        </View>

        {/* User Info Card */}
        <Card variant="elevated" padding="lg" className="mx-4 mb-6">
          <View className="items-center">
            {/* Avatar */}
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
              {user?.avatar ? (
                <Typography variant="h3" className="text-primary-500">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </Typography>
              ) : (
                <Ionicons name="person" size={32} color={Colors.primary[500]} />
              )}
            </View>

            {/* User Info */}
            <Typography variant="h5" className="text-text-primary mb-1">
              {user?.name || "Пользователь"}
            </Typography>
            <Typography variant="body2" color="secondary" className="mb-4">
              {user?.phoneNumber || "+7 000 000 00 00"}
            </Typography>

            {/* Edit Profile Button */}
            <Button
              variant="outline"
              size="sm"
              onPress={handleEditProfile}
              className="min-w-32"
            >
              Редактировать
            </Button>
          </View>
        </Card>

        {/* Menu Items */}
        <View className="mb-6">
          <ProfileMenuItem
            icon="settings-outline"
            title="Настройки"
            subtitle="Уведомления, конфиденциальность"
            onPress={handleSettings}
          />

          <ProfileMenuItem
            icon="help-circle-outline"
            title="Поддержка"
            subtitle="Помощь и обратная связь"
            onPress={handleSupport}
          />

          <ProfileMenuItem
            icon="information-circle-outline"
            title="О приложении"
            subtitle="Версия 1.0.0"
            onPress={handleAbout}
          />
        </View>

        {/* Logout Button */}
        <View className="px-4">
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onPress={handleLogout}
            className="border border-error-main"
          >
            <Typography variant="subtitle1" className="text-error-main">
              Выйти из аккаунта
            </Typography>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
