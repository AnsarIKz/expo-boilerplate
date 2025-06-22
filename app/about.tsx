import { TitleHeader } from "@/components/ui/TitleHeader";
import { Typography } from "@/components/ui/Typography";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  const appVersion = "1.0.0";
  const buildNumber = "101";

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
          <View className="flex-row justify-between items-center mb-2">
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
          <View className="flex-row justify-between items-center">
            <Typography variant="body1" color="secondary">
              Номер сборки
            </Typography>
            <Typography
              variant="body1"
              className="text-text-primary font-medium"
            >
              {buildNumber}
            </Typography>
          </View>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Typography
            variant="h6"
            className="text-text-primary font-semibold mb-3"
          >
            О приложении
          </Typography>
          <Typography
            variant="body1"
            color="secondary"
            className="leading-6 mb-4"
          >
            помогает вам находить лучшие рестораны в вашем городе, бронировать
            столики и делиться впечатлениями. Мы собрали самые популярные
            заведения с проверенными отзывами и удобной системой бронирования.
          </Typography>
        </View>

        <View className="items-center pt-4 border-t border-border-light">
          <Typography
            variant="caption"
            color="secondary"
            className="text-center"
          >
            © 2024 Все права защищены.
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
