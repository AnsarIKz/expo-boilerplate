import { TitleHeader } from "@/components/ui/TitleHeader";
import { Typography } from "@/components/ui/Typography";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  const appVersion = "1.0.4";

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <TitleHeader title="О приложении" showBackButton />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo and Name */}
        <View className="items-center mb-8">
          <Typography variant="body1" color="secondary" className="text-center">
            Ваш гид по лучшим ресторанам города
          </Typography>
        </View>

        {/* Version Info */}
        <View className="bg-background-cream rounded-xl p-4 mb-6">
          <View className="flex-row justify-between items-center">
            <Typography variant="body1" color="secondary">
              Версия приложения
            </Typography>
            <Typography
              variant="body1"
              className="text-text-primary font-medium"
            >
              {appVersion}
            </Typography>
          </View>
        </View>

        <Typography variant="caption" color="secondary" className="text-center">
          © 2025 Все права защищены.
        </Typography>
      </ScrollView>
    </SafeAreaView>
  );
}
