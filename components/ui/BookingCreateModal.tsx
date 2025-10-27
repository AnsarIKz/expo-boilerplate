import { useTimeSlots } from "@/hooks/useTimeSlots";
import { useToast } from "@/providers/ToastProvider";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Restaurant } from "../../entities/Restaurant";
import { BookingRequest } from "../../types/booking";
import { Colors } from "../tokens";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { Input } from "./Input";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { Typography } from "./Typography";

interface BookingCreateModalProps {
  visible: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onSubmit: (booking: BookingRequest) => void;
  initialGuests?: number;
  startStep?: "datetime" | "details";
}

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

// Генерируем динамические даты начиная с сегодня
const generateDateOptions = () => {
  const options = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const value = date.toISOString().split("T")[0]; // YYYY-MM-DD format
    let label;

    if (i === 0) {
      label = "Сегодня";
    } else if (i === 1) {
      label = "Завтра";
    } else {
      label = date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
    }

    options.push({ value, label });
  }

  return options;
};

const DATE_OPTIONS = generateDateOptions();

// Будем получать временные слоты динамически через API

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
            className="text-neutral-900 font-semibold flex-1 text-right"
            numberOfLines={1}
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

export function BookingCreateModal({
  visible,
  onClose,
  restaurant,
  onSubmit,
  initialGuests = 2,
  startStep = "datetime",
}: BookingCreateModalProps) {
  const [step, setStep] = useState<"datetime" | "details">(startStep);
  const [selectedGuests, setSelectedGuests] = useState(initialGuests);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guest_name, setGuestName] = useState("");
  const [guest_phone, setGuestPhone] = useState("");
  const [special_requests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showWarning } = useToast();

  // Получаем временные слоты для выбранной даты
  const {
    timeSlots,
    isLoading: isLoadingAvailability,
    error: availabilityError,
    hasAvailableSlots,
    isTimeAvailable,
    restaurantInfo,
  } = useTimeSlots(restaurant.id, selectedDate);

  // Сбрасываем выбранное время, если оно недоступно для новой даты
  useEffect(() => {
    if (selectedTime && !isTimeAvailable(selectedTime)) {
      setSelectedTime("");
    }
  }, [selectedTime, isTimeAvailable]);

  const isDateTimeValid = selectedDate && selectedTime && selectedGuests;
  const isFormValid = guest_name.trim() && guest_phone.trim();

  const handleClose = () => {
    setStep(startStep);
    setSelectedGuests(initialGuests);
    setSelectedDate("");
    setSelectedTime("");
    setGuestName("");
    setGuestPhone("");
    setSpecialRequests("");
    onClose();
  };

  const handleDateTimeNext = () => {
    if (!isDateTimeValid) {
      showWarning("Ошибка", "Пожалуйста, выберите все параметры бронирования");
      return;
    }
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      showWarning("Ошибка", "Пожалуйста, заполните все обязательные поля");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingRequest: BookingRequest = {
        restaurantId: restaurant.id,
        date: selectedDate,
        time: selectedTime,
        guests: selectedGuests,
        customerName: guest_name.trim(),
        customerPhone: guest_phone.trim(),
        comment: special_requests.trim() || undefined,
      };

      await onSubmit(bookingRequest);
      // Уведомление показывается в onSubmit callback
      handleClose();
    } catch (error) {
      showWarning("Ошибка", "Не удалось забронировать столик");
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
          {selectedDate ? (
            <>
              {isLoadingAvailability ? (
                <View className="py-8 items-center">
                  <Typography
                    variant="h6"
                    className="mb-4 text-neutral-900 font-semibold"
                  >
                    Время
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-text-secondary text-center"
                  >
                    Загружаем свободные слоты...
                  </Typography>
                </View>
              ) : availabilityError ? (
                <View className="py-8 items-center">
                  <Typography
                    variant="h6"
                    className="mb-4 text-neutral-900 font-semibold"
                  >
                    Время
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-red-500 text-center mb-4"
                  >
                    Ошибка загрузки доступности. Попробуйте позже.
                  </Typography>
                </View>
              ) : (
                <>
                  <TimeSlotSelector
                    timeSlots={timeSlots}
                    selectedTime={selectedTime}
                    onTimeSelect={setSelectedTime}
                    restaurantInfo={
                      restaurantInfo
                        ? {
                            dayOfWeek: restaurantInfo.dayOfWeek,
                            openingTime: restaurantInfo.openingTime,
                            closingTime: restaurantInfo.closingTime,
                          }
                        : undefined
                    }
                  />
                </>
              )}
            </>
          ) : (
            <View className="py-8 items-center">
              <Typography
                variant="h6"
                className="mb-4 text-neutral-900 font-semibold"
              >
                Время
              </Typography>
              <Typography
                variant="body2"
                className="text-text-secondary text-center"
              >
                Сначала выберите дату, чтобы увидеть доступные времена
              </Typography>
            </View>
          )}
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
              value={guest_name}
              onChangeText={setGuestName}
              placeholder="Введите ваше полное имя"
              autoCapitalize="words"
              leftIcon="person-outline"
            />

            <View className="h-2 bg-black-500" />

            <Input
              value={guest_phone}
              onChangeText={setGuestPhone}
              placeholder="+7 (___) ___-__-__"
              keyboardType="phone-pad"
              leftIcon="call-outline"
            />

            <View className="h-2 bg-black-500" />
            <Input
              value={special_requests}
              onChangeText={setSpecialRequests}
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
