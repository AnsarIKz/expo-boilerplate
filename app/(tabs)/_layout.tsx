import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/components/tokens";
import { FavoritesTabIcon } from "@/components/ui/FavoritesTabIcon";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: Colors.neutral[500],
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: undefined,
        tabBarLabelStyle: {
          fontFamily: "SF Pro Text",
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarStyle: Platform.select({
          ios: {
            // Use background color to match app background
            position: "absolute",
            backgroundColor: Colors.background.primary,
            borderTopColor: Colors.border.light,
          },
          default: {
            backgroundColor: Colors.background.primary,
            borderTopColor: Colors.border.light,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Главная",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? "house.fill" : "house"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: "Бронирования",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? "calendar" : "calendar"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Избранное",
          tabBarIcon: ({ color, focused }) => (
            <FavoritesTabIcon color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? "person.fill" : "person"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
