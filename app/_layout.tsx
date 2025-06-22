import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/useColorScheme";
import { CityProvider } from "@/providers/CityProvider";
import { FiltersProvider } from "@/providers/FiltersProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Load fonts asynchronously
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    // Системные шрифты SF Pro будут использоваться автоматически на iOS
    ...(Platform.OS === "ios"
      ? {}
      : {
          "SF-Pro-Text": require("../assets/fonts/SpaceMono-Regular.ttf"),
          "SF-Pro-Display": require("../assets/fonts/SpaceMono-Regular.ttf"),
        }),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <CityProvider>
          <FiltersProvider>
            <ToastProvider>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                  }}
                >
                  <Stack.Screen
                    name="(tabs)"
                    options={{
                      headerShown: false,
                      gestureEnabled: false,
                    }}
                  />
                  <Stack.Screen
                    name="+not-found"
                    options={{
                      title: "Страница не найдена",
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="city-selector"
                    options={{
                      presentation: "modal",
                      headerShown: false,
                      gestureEnabled: true,
                      animation: "slide_from_bottom",
                    }}
                  />
                  <Stack.Screen
                    name="filters"
                    options={{
                      presentation: "modal",
                      headerShown: false,
                      gestureEnabled: true,
                      animation: "slide_from_bottom",
                    }}
                  />
                </Stack>
                <StatusBar style="dark" />
              </ThemeProvider>
            </ToastProvider>
          </FiltersProvider>
        </CityProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
