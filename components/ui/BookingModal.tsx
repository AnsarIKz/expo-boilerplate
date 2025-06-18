import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Restaurant } from "../../entities/Restaurant";
import { BookingRequest, TimeSlot } from "../../types/booking";
import { Colors } from "../tokens";
import { Button } from "./Button";
import { Card } from "./Card";
import { DateSelector } from "./DateSelector";
import { Input } from "./Input";
import { SimpleGuestSelector } from "./SimpleGuestSelector";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { Typography } from "./Typography";

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onSubmit: (booking: BookingRequest) => void;
  initialGuests?: number;
  startStep?: "datetime" | "details";
}

export function BookingModal({
  visible,
  onClose,
  restaurant,
  onSubmit,
  initialGuests = 2,
  startStep = "datetime",
}: BookingModalProps) {
  const [step, setStep] = useState<"datetime" | "details">(startStep);
  const [guests, setGuests] = useState(initialGuests);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with today's date
  useState(() => {
    const today = new Date();
    setSelectedDate(today.toISOString().split("T")[0]);
  });

  // Mock time slots - in real app this would come from API
  const getTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const times = [
      "08:30",
      "09:00",
      "10:30",
      "11:00",
      "11:30",
      "13:30",
      "14:30",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "21:30",
      "22:00",
    ];

    times.forEach((time, index) => {
      // Mock availability - use consistent seed based on time and date
      const seed = date + time;
      const hash = seed.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      const available = Math.abs(hash) % 10 > 2; // ~70% availability

      slots.push({
        time,
        available,
        maxGuests: 8,
      });
    });

    return slots;
  };

  const timeSlots = getTimeSlots(selectedDate);

  const handleClose = () => {
    setStep(startStep);
    setGuests(initialGuests);
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setComment("");
    onClose();
  };

  const handleDateTimeNext = () => {
    if (!selectedTime) {
      Alert.alert(
        "Выберите время",
        "Необходимо выбрать доступное время для продолжения."
      );
      return;
    }
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      Alert.alert("Требуется имя", "Пожалуйста, введите ваше имя.");
      return;
    }

    if (!customerPhone.trim()) {
      Alert.alert(
        "Требуется телефон",
        "Пожалуйста, введите ваш номер телефона."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const booking: BookingRequest = {
        restaurantId: restaurant.id,
        date: selectedDate,
        time: selectedTime,
        guests,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        comment: comment.trim() || undefined,
      };

      await onSubmit(booking);
      handleClose();
    } catch (error) {
      Alert.alert(
        "Ошибка бронирования",
        "Что-то пошло не так. Попробуйте снова."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDateTimeStep = () => (
    <View className="flex-1 bg-background-primary">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="pt-6 pb-4">
          <Typography variant="h5" className="text-text-primary mb-6">
            Бронирование столика
          </Typography>

          <Card variant="elevated" padding="md" className="mb-4">
            <SimpleGuestSelector
              value={guests}
              onChange={setGuests}
              min={1}
              max={10}
              label="Количество гостей"
            />
          </Card>

          <Card variant="elevated" padding="md" className="mb-4">
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </Card>

          <Card variant="elevated" padding="md" className="mb-6">
            <TimeSlotSelector
              timeSlots={timeSlots}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
            />
          </Card>
        </View>
      </ScrollView>

      <View className="px-4 pb-6 border-t border-border-light pt-4 bg-background-primary">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleDateTimeNext}
          disabled={!selectedTime}
        >
          Продолжить
        </Button>
      </View>
    </View>
  );

  const renderDetailsStep = () => (
    <View className="flex-1 bg-background-primary">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="pt-6 pb-4">
          <Typography variant="h5" className="text-text-primary mb-6">
            Ваши данные
          </Typography>

          <View className="space-y-4">
            <Input
              label="Полное имя"
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Введите ваше полное имя"
              autoCapitalize="words"
              leftIcon="person-outline"
            />

            <Input
              label="Номер телефона"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="+7 (___) ___-__-__"
              keyboardType="phone-pad"
              leftIcon="call-outline"
            />

            <Input
              label="Email (необязательно)"
              value={customerEmail}
              onChangeText={setCustomerEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Input
              label="Особые пожелания (необязательно)"
              value={comment}
              onChangeText={setComment}
              placeholder="Особые пожелания или аллергии..."
              multiline
              numberOfLines={3}
              leftIcon="chatbubble-outline"
            />
          </View>

          <Card variant="elevated" padding="md" className="mt-6">
            <Typography variant="h6" className="text-text-primary mb-3">
              Сводка бронирования
            </Typography>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Typography variant="body2" color="secondary">
                  Ресторан:
                </Typography>
                <Typography variant="body2" className="text-text-primary">
                  {restaurant.name}
                </Typography>
              </View>
              <View className="flex-row justify-between">
                <Typography variant="body2" color="secondary">
                  Дата:
                </Typography>
                <Typography variant="body2" className="text-text-primary">
                  {new Date(selectedDate).toLocaleDateString("ru-RU", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
              </View>
              <View className="flex-row justify-between">
                <Typography variant="body2" color="secondary">
                  Время:
                </Typography>
                <Typography variant="body2" className="text-text-primary">
                  {selectedTime}
                </Typography>
              </View>
              <View className="flex-row justify-between">
                <Typography variant="body2" color="secondary">
                  Гости:
                </Typography>
                <Typography variant="body2" className="text-text-primary">
                  {guests}{" "}
                  {guests === 1
                    ? "человек"
                    : guests < 5
                    ? "человека"
                    : "человек"}
                </Typography>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      <View className="px-4 pb-6 border-t border-border-light pt-4 bg-background-primary">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSubmit}
          disabled={
            isSubmitting || !customerName.trim() || !customerPhone.trim()
          }
        >
          {isSubmitting ? "Бронирование..." : "Подтвердить бронирование"}
        </Button>
      </View>
    </View>
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
      presentationStyle="fullScreen"
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
