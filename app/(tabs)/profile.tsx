import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/components/tokens";
import { AuthRequired } from "@/components/ui/AuthRequired";
import { Card } from "@/components/ui/Card";
import { TitleHeader } from "@/components/ui/TitleHeader";
import { Typography } from "@/components/ui/Typography";
import { useDeleteAccount, useLogout } from "@/hooks/api/useAuth";
import { useDeviceToken } from "@/hooks/useDeviceToken";
import { useAuthStore } from "@/stores/authStore";

// Компонент для пункта меню профиля
const ProfileMenuItem = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  iconColor = Colors.primary[500],
  textColor = "text-text-primary",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  iconColor?: string;
  textColor?: string;
}) => (
  <Card variant="ghost" padding="md" onPress={onPress} className="mb-3 mx-4">
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <View className="flex-1">
        <Typography variant="subtitle1" className={textColor}>
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

// Компонент для неавторизованного пользователя
const AnonymousProfile = ({
  deviceToken,
  isLoading,
  error,
  onLogin,
}: {
  deviceToken: string | null;
  isLoading: boolean;
  error: string | null;
  onLogin: () => void;
}) => {
  const handleSettings = () => {
    router.push("/settings");
  };

  const handleSupport = () => {
    router.push("/support");
  };

  const handleAbout = () => {
    router.push("/about");
  };

  return (
    <>
      {/* User Info Card */}
      <Card variant="ghost" padding="lg" className="mx-4 mb-6 mt-6">
        <View className="items-center">
          {/* Avatar */}
          <View className="w-20 h-20 bg-neutral-200 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={32} color={Colors.neutral[600]} />
          </View>

          {/* User Info */}
          <Typography variant="h5" className="text-text-primary mb-1">
            user
          </Typography>
          <Typography variant="body2" color="secondary" className="mb-4">
            Device Token:{" "}
            {isLoading
              ? "Загрузка..."
              : error
              ? "Ошибка загрузки"
              : deviceToken
              ? deviceToken.substring(0, 12) + "..."
              : "Инициализация..."}
          </Typography>

          {/* Login Button */}
        </View>
      </Card>

      {/* Menu Items */}
      <View className="mb-6 bg-background-cream">
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

      {/* Info Card */}
      <Card variant="ghost" padding="md" className="mx-4">
        <TouchableOpacity onPress={onLogin} className="items-center">
          <Ionicons
            name="person-add-outline"
            size={32}
            color={Colors.primary[500]}
            className="mb-3"
          />
          <Typography
            variant="subtitle1"
            className="text-text-primary mb-2"
            align="center"
          >
            Нажмите для входа
          </Typography>
          <Typography variant="body2" color="secondary" align="center">
            Для получения доступа ко всем функциям приложения
          </Typography>
        </TouchableOpacity>
      </Card>
    </>
  );
};

// Компонент для авторизованного пользователя
const AuthenticatedProfile = ({
  user,
  deviceToken,
  onLogout,
  onDeleteAccount,
}: {
  user: any;
  deviceToken: string | null;
  onLogout: () => void;
  onDeleteAccount: () => void;
}) => {
  const handleEditProfile = () => {
    console.log("Edit profile");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleBookings = () => {
    console.log("Bookings");
  };

  const handlePayments = () => {
    console.log("Payments");
  };

  const handleSupport = () => {
    router.push("/support");
  };

  const handleAbout = () => {
    router.push("/about");
  };

  return (
    <>
      {/* User Info Card */}
      <Card variant="ghost" padding="lg" className="mx-4 mb-6 mt-6">
        <View className="items-center">
          {/* Avatar */}
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
            {user?.profileImageUrl ? (
              <Ionicons name="person" size={32} color={Colors.primary[500]} />
            ) : (
              <Ionicons name="person" size={32} color={Colors.primary[500]} />
            )}
          </View>

          {/* User Info */}
          <Typography variant="h5" className="text-text-primary mb-1">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" color="secondary" className="mb-2">
            ID: {user?.id?.substring(0, 12)}...
          </Typography>
          <Typography variant="body2" color="secondary" className="mb-4">
            Device Token:{" "}
            {deviceToken ? deviceToken.substring(0, 12) + "..." : "Загрузка..."}
          </Typography>
        </View>
      </Card>

      {/* Menu Items */}
      <View className="mb-6">
        <ProfileMenuItem
          icon="card-outline"
          title="Платежи"
          subtitle="Способы оплаты и история"
          onPress={handlePayments}
        />

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

      {/* Account Actions */}
      <View className="mb-6">
        <ProfileMenuItem
          icon="log-out-outline"
          title="Выйти из аккаунта"
          onPress={onLogout}
          showArrow={false}
          iconColor={Colors.warning.main}
        />

        <ProfileMenuItem
          icon="trash-outline"
          title="Удалить аккаунт"
          subtitle="Безвозвратное удаление аккаунта"
          onPress={onDeleteAccount}
          showArrow={false}
          iconColor={Colors.error.main}
          textColor="text-red-500"
        />
      </View>
    </>
  );
};

export default function ProfileScreen() {
  const { isAuthenticated, user } = useAuthStore();
  const { deviceToken, isRegistered, isLoading, error } = useDeviceToken();
  const logoutMutation = useLogout();
  const deleteAccountMutation = useDeleteAccount();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Отладочная информация
  console.log("🔍 Profile Debug:", {
    isAuthenticated,
    deviceToken: deviceToken ? `${deviceToken.substring(0, 8)}...` : null,
    isRegistered,
    isLoading,
    error,
  });

  const handleLogout = () => {
    Alert.alert("Выход", "Вы уверены, что хотите выйти из аккаунта?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Выйти",
        style: "destructive",
        onPress: () => {
          logoutMutation.mutate();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Удаление аккаунта",
      "Вы уверены, что хотите навсегда удалить свой аккаунт? Это действие нельзя отменить.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            deleteAccountMutation.mutate();
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <TitleHeader title="Профиль" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {isAuthenticated ? (
          <AuthenticatedProfile
            user={user}
            deviceToken={deviceToken}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        ) : (
          <AnonymousProfile
            deviceToken={deviceToken}
            isLoading={isLoading}
            error={error}
            onLogin={handleLogin}
          />
        )}
      </ScrollView>

      {/* Auth Modal */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <AuthRequired onClose={() => setShowAuthModal(false)} />
      </Modal>
    </SafeAreaView>
  );
}
