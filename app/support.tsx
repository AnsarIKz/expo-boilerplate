import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TitleHeader } from "@/components/ui/TitleHeader";
import { useToast } from "@/providers/ToastProvider";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SUPPORT_CATEGORIES = [
  { id: "booking", label: "Бронирование", icon: "calendar-outline" },
  { id: "payment", label: "Оплата", icon: "card-outline" },
  { id: "account", label: "Аккаунт", icon: "person-outline" },
  { id: "technical", label: "Технические проблемы", icon: "settings-outline" },
  { id: "other", label: "Другое", icon: "help-circle-outline" },
];

export default function SupportScreen() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showSuccess, showWarning } = useToast();

  const handleSubmit = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !message.trim() ||
      !selectedCategory
    ) {
      showWarning("Ошибка", "Пожалуйста, заполните все поля");
      return;
    }

    setIsSubmitting(true);

    try {
      // Здесь будет отправка на сервер
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Симуляция отправки

      showSuccess(
        "Успешно!",
        "Ваше обращение отправлено. Мы свяжемся с вами в ближайшее время."
      );

      // Очистка формы
      setSelectedCategory("");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      showWarning(
        "Ошибка",
        "Не удалось отправить обращение. Попробуйте позже."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    selectedCategory &&
    name.trim() &&
    email.trim() &&
    subject.trim() &&
    message.trim();

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <TitleHeader title="Поддержка" showBackButton />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selection */}

        {/* Form Fields */}
        <View className="mb-6">
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Ваше имя"
            leftIcon="person-outline"
          />
          <View className="mb-2" />
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View className="mb-2" />
          <Input
            value={subject}
            onChangeText={setSubject}
            placeholder="Тема обращения"
            leftIcon="document-text-outline"
          />
          <View className="mb-2" />
          <Input
            value={message}
            onChangeText={setMessage}
            placeholder="Описание проблемы..."
            leftIcon="chatbubble-outline"
            multiline
            numberOfLines={6}
            style={{ height: 120, textAlignVertical: "top" }}
          />
        </View>

        <Button
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
          className="mb-6"
        >
          {isSubmitting ? "Отправляем..." : "Отправить обращение"}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
