import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Страница не найдена" }} />
      <SafeAreaView className="flex-1 bg-background-primary">
        <View className="flex-1">
          <EmptyState
            title="Страница не найдена"
            subtitle="Запрашиваемая страница не существует или была перемещена"
            iconName="alert-circle-outline"
          />

          <View className="px-6 pb-8">
            <Link href="/" asChild>
              <Button variant="primary" size="lg" fullWidth>
                На главную
              </Button>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
