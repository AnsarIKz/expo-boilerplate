import { Restaurant } from "@/entities/Restaurant";
import { Booking } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../tokens";
import { Button } from "./Button";
import { Toast } from "./Toast";
import { Typography } from "./Typography";

interface BookingDetailsModalProps {
  visible: boolean;
  booking: Booking | null;
  restaurant?: Restaurant;
  onClose: () => void;
  onCancel?: (booking: Booking) => void;
  onRate?: (booking: Booking, rating: number) => void;
}

export function BookingDetailsModal({
  visible,
  booking,
  restaurant,
  onClose,
  onCancel,
  onRate,
}: BookingDetailsModalProps) {
  const [rating, setRating] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editedPhone, setEditedPhone] = useState(booking?.customerPhone || "");

  if (!booking) return null;

  // Форматирование полной даты
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Цвет и текст статуса
  const getStatusInfo = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return { color: Colors.success.main, text: "Подтверждено" };
      case "pending":
        return { color: Colors.warning.main, text: "Ожидает подтверждения" };
      case "cancelled":
        return { color: Colors.neutral[400], text: "Отменено" };
      default:
        return { color: Colors.neutral[500], text: "Неизвестно" };
    }
  };

  const handleClose = () => {
    // Если была выставлена оценка, отправляем её и показываем тост
    if (rating > 0 && booking.status === "confirmed") {
      onRate?.(booking, rating);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setRating(0);
        onClose();
      }, 2000);
    } else {
      setRating(0);
      onClose();
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      "Отменить бронирование",
      "Вы уверены, что хотите отменить это бронирование?",
      [
        { text: "Нет", style: "cancel" },
        {
          text: "Да, отменить",
          style: "destructive",
          onPress: () => {
            onCancel?.(booking);
            onClose();
          },
        },
      ]
    );
  };

  const statusInfo = getStatusInfo(booking.status);
  const restaurantImage =
    restaurant?.image ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop";

  // Проверка статуса оплаты и времени
  const isEventNow = () => {
    if (!booking) return false;
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const [hours, minutes] = booking.time.split(":").map(Number);
    bookingDate.setHours(hours, minutes);

    // Событие проходит в течение 2 часов после назначенного времени
    const eventEnd = new Date(bookingDate.getTime() + 2 * 60 * 60 * 1000);
    return now >= bookingDate && now <= eventEnd;
  };

  const shouldShowPayment = () => {
    if (!booking || booking.status === "cancelled") return false;
    // Показываем кнопку оплаты если не оплачено и событие еще не прошло
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const [hours, minutes] = booking.time.split(":").map(Number);
    bookingDate.setHours(hours, minutes);

    return !booking.isPaid && now < bookingDate;
  };

  const handleSavePhone = () => {
    // Здесь можно добавить логику сохранения номера телефона
    setIsEditingPhone(false);
  };

  const handlePayment = () => {
    // Логика оплаты
    Alert.alert("Оплата", "Переход к оплате...");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-background-cream">
        {/* Заголовок */}
        <SafeAreaView>
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
            <Typography
              variant="body1"
              className="text-text-primary font-semibold"
            >
              Детали бронирования
            </Typography>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={20} color={Colors.neutral[600]} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24 }}
        >
          {/* Фото ресторана */}
          <View className="mb-6">
            <Image
              source={{ uri: restaurantImage }}
              className="w-full h-48 rounded-xl"
              resizeMode="cover"
            />
          </View>

          {/* Название ресторана и дата */}
          <View className="mb-6">
            <View className="flex-row justify-between items-start mb-2">
              <Typography
                variant="h4"
                className="text-text-primary font-bold flex-1 mr-4"
              >
                {booking.restaurantName}
              </Typography>
              <View className="items-end">
                <Typography
                  variant="body2"
                  color="secondary"
                  className="text-xs"
                >
                  {formatFullDate(booking.date)}
                </Typography>
                <Typography
                  variant="h6"
                  className="text-text-primary font-semibold"
                >
                  {booking.time}
                </Typography>
              </View>
            </View>

            {restaurant?.location?.address && (
              <Typography variant="body1" color="secondary" className="mb-2">
                {restaurant.location.address}
              </Typography>
            )}
          </View>

          {/* Информация о бронировании - упрощенная */}

          {/* Кто забронировал */}
          <View className="mb-3">
            <Typography variant="caption" color="secondary" className="mb-1">
              Забронировал
            </Typography>
            <Typography
              variant="body1"
              className="text-text-primary font-medium"
            >
              {booking.customerName}
            </Typography>
          </View>

          {/* Количество гостей */}
          <View className="mb-3">
            <Typography variant="caption" color="secondary" className="mb-1">
              Количество гостей
            </Typography>
            <Typography
              variant="body1"
              className="text-text-primary font-medium"
            >
              {booking.guests} {booking.guests === 1 ? "гость" : "гостей"}
            </Typography>

            {/* Телефон с возможностью редактирования */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <Typography variant="caption" color="secondary">
                  Номер телефона
                </Typography>
              </View>

              <Typography
                variant="body1"
                className="text-text-primary font-medium"
              >
                {booking.customerPhone}
              </Typography>
            </View>

            {/* Email */}
            {booking.customerEmail && (
              <View className="mb-3">
                <Typography
                  variant="caption"
                  color="secondary"
                  className="mb-1"
                >
                  Email
                </Typography>
                <Typography
                  variant="body1"
                  className="text-text-primary font-medium"
                >
                  {booking.customerEmail}
                </Typography>
              </View>
            )}

            {/* Комментарий */}
            {booking.comment && (
              <View>
                <Typography
                  variant="caption"
                  color="secondary"
                  className="mb-1"
                >
                  Комментарий
                </Typography>
                <Typography variant="body1" className="text-text-primary">
                  {booking.comment}
                </Typography>
              </View>
            )}
          </View>

          {/* Фискальный чек - стиль чека */}
          <View className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6">
            <View className="border-b border-gray-200 pb-3 mb-3">
              <Typography
                variant="h6"
                className="text-center text-text-primary font-bold"
              >
                ФИСКАЛЬНЫЙ ЧЕК
              </Typography>
              <Typography
                variant="caption"
                className="text-center text-gray-500"
              >
                {booking.restaurantName}
              </Typography>
            </View>

            <View className="space-y-2 mb-4">
              <View className="flex-row justify-between">
                <Typography variant="body2" color="secondary">
                  Бронирование стола
                </Typography>
                <Typography variant="body2" className="text-text-primary">
                  1 × 500₽
                </Typography>
              </View>
              <View className="flex-row justify-between">
                <Typography variant="body2" color="secondary">
                  Гости: {booking.guests}
                </Typography>
                <Typography variant="body2" className="text-text-primary">
                  {booking.guests} × 200₽
                </Typography>
              </View>
              <View className="border-t border-gray-200 pt-2 flex-row justify-between">
                <Typography
                  variant="body1"
                  className="text-text-primary font-semibold"
                >
                  Итого:
                </Typography>
                <Typography
                  variant="body1"
                  className="text-text-primary font-bold"
                >
                  {500 + booking.guests * 200}₽
                </Typography>
              </View>
            </View>

            {/* Статус оплаты */}
            <View className="flex-row items-center justify-center mb-3">
              {booking.isPaid ? (
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.success.main}
                  />
                  <Typography
                    variant="body2"
                    className="ml-2 text-success-main font-medium"
                  >
                    Оплачено
                  </Typography>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="time" size={20} color={Colors.warning.main} />
                  <Typography
                    variant="body2"
                    className="ml-2 text-warning-main font-medium"
                  >
                    Ожидает оплаты
                  </Typography>
                </View>
              )}
            </View>

            {/* Кнопка оплаты */}
            {shouldShowPayment() && (
              <Button
                variant="primary"
                size="lg"
                onPress={handlePayment}
                className="bg-success-main"
              >
                <Typography
                  variant="subtitle1"
                  className="text-white font-semibold"
                >
                  Оплатить {500 + booking.guests * 200}₽
                </Typography>
              </Button>
            )}
          </View>

          {/* Оценка заведения */}
          {booking.status === "confirmed" && (
            <View className="mb-6">
              {/* Звезды */}
              <View className="flex-row items-center justify-center py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    className="mx-2"
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={36}
                      color={star <= rating ? Colors.star : Colors.neutral[300]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Кнопка отмены */}
          {booking.status === "confirmed" && onCancel && (
            <Button
              variant="outline"
              size="lg"
              onPress={handleCancelBooking}
              className="border-error-main mb-4"
            >
              <Typography variant="subtitle1" className="text-error-main">
                Отменить бронирование
              </Typography>
            </Button>
          )}
        </ScrollView>
      </View>
      {showToast && (
        <Toast
          type="success"
          title="Спасибо за оценку!"
          message="Ваша оценка успешно отправлена"
          visible={showToast}
          onDismiss={() => setShowToast(false)}
        />
      )}
    </Modal>
  );
}
