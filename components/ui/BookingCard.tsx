import { Restaurant } from "@/entities/Restaurant";
import { Booking } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { Image, TouchableOpacity, View } from "react-native";
import { Colors } from "../tokens";
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
        return "✓";
      case "pending":
        return "⏳";
      case "cancelled":
        return "✕";
      default:
        return "?";
    }
  };

  const restaurantImage =
    restaurant?.image ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop";

  return (
    <TouchableOpacity
      onPress={() => onPress?.(booking)}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View
        className="bg-background-cream border border-background-cream rounded-xl overflow-hidden"
        style={{
          backgroundColor: "#fffaea",
          borderColor: "#fffaea",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <View className="flex-row h-24">
          {/* Изображение ресторана */}
          <View className="w-20 h-full relative">
            <Image
              source={{ uri: restaurantImage }}
              className="w-full h-full"
              style={{ borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}
              resizeMode="cover"
            />
            {/* Статус бейдж на изображении */}
            <View className="absolute top-1 right-1">
              <View
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{ backgroundColor: getStatusColor(booking.status) }}
              >
                <Typography
                  variant="caption"
                  className="text-white font-bold text-xs"
                >
                  {getStatusText(booking.status)}
                </Typography>
              </View>
            </View>
          </View>

          {/* Контент */}
          <View className="flex-1 p-3">
            {/* Заголовок */}
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 mr-2">
                <Typography
                  variant="body1"
                  className="text-text-primary font-bold"
                  numberOfLines={1}
                >
                  {booking.restaurantName}
                </Typography>
                {restaurant?.location?.address && (
                  <Typography
                    variant="caption"
                    className="text-text-secondary"
                    numberOfLines={1}
                  >
                    {restaurant.location.address}
                  </Typography>
                )}
              </View>
            </View>

            {/* Основная информация */}
            <View className="flex-row items-center justify-between">
              {/* Дата и время */}
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={Colors.primary[500]}
                />
                <Typography
                  variant="caption"
                  className="text-text-primary ml-1 font-medium"
                >
                  {formatDate(booking.date)}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-text-secondary mx-1"
                >
                  •
                </Typography>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={Colors.primary[500]}
                />
                <Typography
                  variant="caption"
                  className="text-text-primary ml-1 font-medium"
                >
                  {booking.time}
                </Typography>
              </View>

              {/* Количество гостей */}
              <View className="flex-row items-center">
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={Colors.primary[500]}
                />
                <Typography
                  variant="caption"
                  className="text-text-primary ml-1 font-medium"
                >
                  {booking.guests}
                </Typography>
              </View>
            </View>

            {/* Комментарий (если есть и помещается) */}
            {booking.comment && (
              <Typography
                variant="caption"
                className="text-text-secondary mt-1"
                numberOfLines={1}
              >
                💬 {booking.comment}
              </Typography>
            )}
          </View>

          {/* Действия */}
          {showActions && booking.status === "confirmed" && onCancel && (
            <View className="justify-center pr-2">
              <TouchableOpacity
                onPress={() => onCancel(booking)}
                className="w-9 h-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${Colors.error.main}20` }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={Colors.error.main}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
