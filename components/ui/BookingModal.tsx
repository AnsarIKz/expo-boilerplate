import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Restaurant } from "../../entities/Restaurant";
import { BookingRequest } from "../../types/booking";
import { Colors } from "../tokens";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { Input } from "./Input";
import { Typography } from "./Typography";

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onSubmit: (booking: BookingRequest) => void;
  initialGuests?: number;
  startStep?: "datetime" | "details";
}

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

const DATE_OPTIONS = [
  { value: "2024-01-15", label: "Сегодня" },
  { value: "2024-01-16", label: "Завтра" },
  { value: "2024-01-17", label: "17 янв" },
  { value: "2024-01-18", label: "18 янв" },
  { value: "2024-01-19", label: "19 янв" },
  { value: "2024-01-20", label: "20 янв" },
  { value: "2024-01-21", label: "21 янв" },
];

const TIME_SLOTS = [
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
];

const BookingSummary = ({
  restaurant,
  selectedGuests,
  selectedDate,
  selectedTime,
}: {
  restaurant: Restaurant;
  selectedGuests: number;
  selectedDate: string;
  selectedTime: string;
}) => {
  return (
    <View className="bg-background-cream border border-primary-200 rounded-2xl p-6 mb-6 mx-2">
      <Typography
        variant="h6"
        className="mb-4 text-primary-700 font-semibold text-center"
      >
        Детали бронирования
      </Typography>
      <View className="space-y-3">
        <View className="flex-row justify-between items-center">
          <Typography variant="body2" className="text-neutral-600 font-medium">
            Ресторан:
          </Typography>
          <Typography
            variant="body2"
            className="text-neutral-900 font-semibold"
          >
            {restaurant.name}
          </Typography>
        </View>
        <View className="flex-row justify-between items-center">
          <Typography variant="body2" className="text-neutral-600 font-medium">
            Гостей:
          </Typography>
          <Typography
            variant="body2"
            className="text-neutral-900 font-semibold"
          >
            {selectedGuests}
          </Typography>
        </View>
        <View className="flex-row justify-between items-center">
          <Typography variant="body2" className="text-neutral-600 font-medium">
            Дата:
          </Typography>
          <Typography
            variant="body2"
            className="text-neutral-900 font-semibold"
          >
            {DATE_OPTIONS.find((d) => d.value === selectedDate)?.label}
          </Typography>
        </View>
        <View className="flex-row justify-between items-center">
          <Typography variant="body2" className="text-neutral-600 font-medium">
            Время:
          </Typography>
          <Typography
            variant="body2"
            className="text-neutral-900 font-semibold"
          >
            {selectedTime}
          </Typography>
        </View>
      </View>
    </View>
  );
};

export function BookingModal({
  visible,
  onClose,
  restaurant,
  onSubmit,
  initialGuests = 2,
  startStep = "datetime",
}: BookingModalProps) {
  const [step, setStep] = useState<"datetime" | "details">(startStep);
  const [selectedGuests, setSelectedGuests] = useState(initialGuests);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDateTimeValid = selectedDate && selectedTime && selectedGuests;
  const isFormValid = customerName.trim() && customerPhone.trim();

  const handleClose = () => {
    setStep(startStep);
    setSelectedGuests(initialGuests);
    setSelectedDate("");
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setComment("");
    onClose();
  };

  const handleDateTimeNext = () => {
    if (!isDateTimeValid) {
      Alert.alert("Ошибка", "Пожалуйста, выберите все параметры бронирования");
      return;
    }
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все обязательные поля");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingRequest: BookingRequest = {
        restaurantId: restaurant.id,
        date: selectedDate,
        time: selectedTime,
        guests: selectedGuests,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        comment: comment.trim() || undefined,
      };

      await onSubmit(bookingRequest);
      Alert.alert(
        "Успешно!",
        `Столик на ${selectedGuests} ${
          selectedGuests === 1 ? "человека" : "человек"
        } забронирован на ${selectedDate} в ${selectedTime}`,
        [
          {
            text: "OK",
            onPress: handleClose,
          },
        ]
      );
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось забронировать столик");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDateTimeStep = () => (
    <>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Guest Selection */}
        <View className="mb-8 mt-4">
          <Typography
            variant="h6"
            className="mb-4 text-neutral-900 font-semibold"
          >
            Количество гостей
          </Typography>
          <View className="flex-row flex-wrap gap-3 justify-center">
            {GUEST_OPTIONS.map((guests) => (
              <View key={guests} className="mb-2">
                <Chip
                  label={`${guests} ${
                    guests === 1 ? "гость" : guests <= 4 ? "гостя" : "гостей"
                  }`}
                  isSelected={selectedGuests === guests}
                  onPress={() => setSelectedGuests(guests)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Date Selection */}
        <View className="mb-8">
          <Typography
            variant="h6"
            className="mb-4 text-neutral-900 font-semibold"
          >
            Дата
          </Typography>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingRight: 32,
              gap: 12,
            }}
          >
            {DATE_OPTIONS.map((date) => (
              <Chip
                key={date.value}
                label={date.label}
                isSelected={selectedDate === date.value}
                onPress={() => setSelectedDate(date.value)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View className="mb-8">
          <Typography
            variant="h6"
            className="mb-4 text-neutral-900 font-semibold"
          >
            Время
          </Typography>
          <View className="flex-row flex-wrap justify-center gap-3">
            {TIME_SLOTS.map((time) => (
              <View key={time} className="mb-2">
                <Chip
                  label={time}
                  isSelected={selectedTime === time}
                  onPress={() => setSelectedTime(time)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Booking Summary */}
        {isDateTimeValid && (
          <BookingSummary
            restaurant={restaurant}
            selectedGuests={selectedGuests}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        )}
      </ScrollView>

      <View className="px-4 pb-6 border-t border-border-light pt-4 bg-background-primary">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleDateTimeNext}
          disabled={!isDateTimeValid}
        >
          Продолжить
        </Button>
      </View>
    </>
  );

  const renderDetailsStep = () => (
    <>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="pt-6 pb-4">
          <View className="pb-4">
            <Input
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Введите ваше полное имя"
              autoCapitalize="words"
              leftIcon="person-outline"
            />

            <View className="h-2 bg-black-500" />

            <Input
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="+7 (___) ___-__-__"
              keyboardType="phone-pad"
              leftIcon="call-outline"
            />

            <View className="h-2 bg-black-500" />
            <Input
              value={customerEmail}
              onChangeText={setCustomerEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <View className="h-2 bg-black-500" />
            <Input
              value={comment}
              onChangeText={setComment}
              placeholder="Особые пожелания..."
              multiline
              numberOfLines={3}
              leftIcon="chatbubble-outline"
            />
          </View>
          <BookingSummary
            restaurant={restaurant}
            selectedGuests={selectedGuests}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        </View>
      </ScrollView>

      <View className="px-4 pb-6 border-t border-border-light pt-4 bg-background-primary">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={!isFormValid || isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? "Бронируем..." : "Забронировать столик"}
        </Button>
      </View>
    </>
  );

  const getStepContent = () => {
    switch (step) {
      case "datetime":
        return renderDateTimeStep();
      case "details":
        return renderDetailsStep();
      default:
        return renderDateTimeStep();
    }
  };

  const canGoBack = step === "details";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
        {/* Header */}
        <View className="px-4 py-4 border-b border-border-light bg-background-primary">
          <View className="flex-row items-center justify-between">
            {canGoBack ? (
              <TouchableOpacity
                onPress={() => {
                  if (step === "details") setStep("datetime");
                }}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={Colors.neutral[600]}
                />
              </TouchableOpacity>
            ) : (
              <View className="w-10" />
            )}

            <Typography
              variant="subtitle1"
              className="text-text-primary font-semibold"
            >
              {step === "datetime" && "Выбор даты и времени"}
              {step === "details" && "Ваши данные"}
            </Typography>

            <TouchableOpacity
              onPress={handleClose}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={24} color={Colors.neutral[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {getStepContent()}
      </SafeAreaView>
    </Modal>
  );
}
