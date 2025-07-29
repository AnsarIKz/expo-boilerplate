import { checkApiHealth } from "@/lib/api/config";
import { useAuthStore } from "@/stores/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Colors } from "../tokens";

export type ToastType = "success" | "warning" | "error";

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case "success":
      return {
        backgroundColor: "#10b981",
        iconName: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
        iconColor: "#ffffff",
        hapticType: Haptics.NotificationFeedbackType.Success,
      };
    case "warning":
      return {
        backgroundColor: "#f59e0b",
        iconName: "warning" as keyof typeof Ionicons.glyphMap,
        iconColor: "#ffffff",
        hapticType: Haptics.NotificationFeedbackType.Warning,
      };
    case "error":
      return {
        backgroundColor: "#ef4444",
        iconName: "close-circle" as keyof typeof Ionicons.glyphMap,
        iconColor: "#ffffff",
        hapticType: Haptics.NotificationFeedbackType.Error,
      };
  }
};

export function Toast({
  type,
  title,
  message,
  action,
  visible,
  onDismiss,
  duration = 4000,
}: ToastProps) {
  const translateY = React.useRef(new Animated.Value(100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  const config = getToastConfig(type);

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(config.hapticType);

      // Show animation - slide up from bottom
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
    // Hide animation - slide down and fade out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <View className="absolute bottom-20 left-0 right-0 z-50 p-4">
      <Animated.View
        style={{
          transform: [{ translateY }],
          opacity,
        }}
        className="bg-background-cream rounded-2xl shadow-xl border border-neutral-200"
      >
        <View className="flex-row items-start p-4">
          {/* Icon */}
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-0.5"
            style={{ backgroundColor: config.backgroundColor }}
          >
            <Ionicons
              name={config.iconName}
              size={22}
              color={config.iconColor}
            />
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text
              className="text-base font-semibold text-neutral-900 mb-1"
              style={{ fontFamily: "SF-Pro-Text" }}
            >
              {title}
            </Text>
            {message && (
              <Text
                className="text-sm text-neutral-600"
                style={{ fontFamily: "SF-Pro-Text" }}
              >
                {message}
              </Text>
            )}
          </View>

          {/* Action Button */}
          {action && (
            <Pressable
              className="ml-3 mt-0.5"
              onPress={() => {
                action.onPress();
                handleDismiss();
              }}
            >
              <View
                className="px-4 py-2 rounded-xl"
                style={{ backgroundColor: config.backgroundColor }}
              >
                <Text
                  className="text-sm font-medium text-white"
                  style={{ fontFamily: "SF-Pro-Text" }}
                >
                  {action.label}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Close Button */}
          <Pressable className="ml-3 p-1" onPress={handleDismiss}>
            <Ionicons name="close" size={20} color={Colors.neutral[400]} />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

export function OfflineIndicator() {
  const { isOffline, setOffline } = useAuthStore();

  // Check network connectivity periodically when offline
  React.useEffect(() => {
    if (!isOffline) return;

    const checkConnection = async () => {
      const isHealthy = await checkApiHealth();
      if (isHealthy) {
        console.log("🌐 Connection restored - going back online");
        setOffline(false);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [isOffline, setOffline]);

  if (!isOffline) return null;

  return (
    <View className="bg-orange-400 px-4 pb-6 flex-row items-center justify-center">
      <Text className="text-white text-sm font-medium">
        Ожидание подключения к интернету...
      </Text>
    </View>
  );
}
