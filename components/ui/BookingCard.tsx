import { Restaurant } from "@/entities/Restaurant";
import { Booking } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { Image, TouchableOpacity, View } from "react-native";
import { Colors } from "../tokens";
import { Card } from "./Card";
import { Typography } from "./Typography";

interface BookingCardProps {
  booking: Booking;
  restaurant?: Restaurant;
  onPress?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  showActions?: boolean;
}

export function BookingCard({
  booking,
  restaurant,
  onPress,
  onCancel,
  showActions = true,
}: BookingCardProps) {
  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Сегодня";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Завтра";
    } else {
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
    }
  };

  // Полная дата для детальной информации
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Цвет статуса
  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return Colors.success.main;
      case "pending":
        return Colors.warning.main;
      case "cancelled":
        return Colors.error.main;
      default:
        return Colors.neutral[500];
    }
  };

  // Текст статуса
  const getStatusText = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "Подтверждено";
      case "pending":
        return "Ожидание";
      case "cancelled":
        return "Отменено";
      default:
        return "Неизвестно";
    }
  };

  const restaurantImage =
    restaurant?.image ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop";

  return (
    <Card
      variant="elevated"
      padding="none"
      onPress={() => onPress?.(booking)}
      className="overflow-hidden"
    >
      <View className="flex-row">
        {/* Изображение ресторана */}
        <View className="w-24 h-24 relative">
          <Image
            source={{ uri: restaurantImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Статус бейдж */}
          <View className="absolute top-2 left-2">
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: getStatusColor(booking.status) }}
            >
              <Typography variant="caption" className="text-white font-medium">
                {getStatusText(booking.status)}
              </Typography>
            </View>
          </View>
        </View>

        {/* Контент */}
        <View className="flex-1 p-4">
          {/* Заголовок */}
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Typography
                variant="subtitle1"
                className="text-text-primary font-semibold"
                numberOfLines={1}
              >
                {booking.restaurantName}
              </Typography>
              {restaurant?.location?.address && (
                <Typography
                  variant="body2"
                  color="secondary"
                  numberOfLines={1}
                  className="mt-1"
                >
                  {restaurant.location.address}
                </Typography>
              )}
            </View>
          </View>

          {/* Информация о бронировании */}
          <View className="flex-row items-center justify-between mb-2">
            {/* Дата и время */}
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-4">
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={Colors.primary[500]}
                />
                <Typography
                  variant="body2"
                  className="text-text-primary ml-1 font-medium"
                >
                  {formatDate(booking.date)}
                </Typography>
              </View>

              <View className="flex-row items-center mr-4">
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={Colors.primary[500]}
                />
                <Typography
                  variant="body2"
                  className="text-text-primary ml-1 font-medium"
                >
                  {booking.time}
                </Typography>
              </View>

              {/* Количество гостей */}
              <View className="flex-row items-center">
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={Colors.primary[500]}
                />
                <Typography
                  variant="body2"
                  className="text-text-primary ml-1 font-medium"
                >
                  {booking.guests}
                </Typography>
              </View>
            </View>
          </View>

          {/* Комментарий */}
          {booking.comment && (
            <Typography
              variant="body2"
              color="secondary"
              numberOfLines={2}
              className="mt-1"
            >
              💬 {booking.comment}
            </Typography>
          )}
        </View>

        {/* Действия */}
        {showActions && booking.status === "confirmed" && onCancel && (
          <View className="justify-center pr-4">
            <TouchableOpacity
              onPress={() => onCancel(booking)}
              className="w-10 h-10 items-center justify-center rounded-xl bg-error-50"
              activeOpacity={0.7}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={Colors.error.main}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );
}
