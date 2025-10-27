import { Restaurant } from "@/entities/Restaurant";
import { Booking } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import { Image, View } from "react-native";
import { Colors } from "../tokens";
import { Card } from "./Card";
import { Typography } from "./Typography";

interface BookingCardProps {
  booking: Booking;
  restaurant?: Restaurant;
  onPress?: (booking: Booking) => void;
}

// Выносим функции форматирования наружу для оптимизации
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

// Цвет статуса
const getStatusColor = (status: Booking["status"]) => {
  switch (status) {
    case "CONFIRMED":
      return Colors.success.main;
    case "PENDING":
      return Colors.warning.main;
    case "CANCELLED":
      return Colors.neutral[400];
    case "COMPLETED":
      return Colors.success.main;
    default:
      return Colors.neutral[500];
  }
};

export const BookingCard = React.memo(function BookingCard({
  booking,
  restaurant,
  onPress,
}: BookingCardProps) {
  const restaurantImage = useMemo(
    () =>
      restaurant?.image ||
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    [restaurant?.image]
  );

  const handlePress = useCallback(() => {
    onPress?.(booking);
  }, [onPress, booking]);

  return (
    <Card
      variant="elevated"
      padding="none"
      onPress={handlePress}
      className="overflow-hidden mb-4 mx-0 rounded-none"
    >
      <View className="flex-row">
        {/* Изображение ресторана */}
        <View className="w-28 h-28 relative">
          <Image
            source={{ uri: restaurantImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Статус индикатор */}
          <View className="absolute top-2 right-2">
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getStatusColor(booking.status) }}
            />
          </View>
        </View>

        {/* Контент */}
        <View className="flex-1 p-4">
          {/* Название и адрес */}
          <View className="mb-3">
            <Typography
              variant="subtitle1"
              className="text-text-primary font-semibold"
              numberOfLines={1}
            >
              {booking.restaurant?.name || booking.restaurantName}
            </Typography>
            {(booking.restaurant?.address || restaurant?.location?.address) && (
              <Typography
                variant="body2"
                color="secondary"
                numberOfLines={1}
                className="mt-1"
              >
                {booking.restaurant?.address || restaurant?.location?.address}
              </Typography>
            )}
          </View>

          {/* Информация о бронировании */}
          <View className="flex-row items-center flex-wrap">
            {/* Дата */}
            <View className="flex-row items-center mr-4 mb-1">
              <Ionicons
                name="calendar-outline"
                size={16}
                color={Colors.primary[500]}
              />
              <Typography
                variant="body2"
                className="text-text-primary ml-1 font-medium"
              >
                {formatDate(booking.booking_date || booking.date || "")}
              </Typography>
            </View>

            {/* Время */}
            <View className="flex-row items-center mr-4 mb-1">
              <Ionicons
                name="time-outline"
                size={16}
                color={Colors.primary[500]}
              />
              <Typography
                variant="body2"
                className="text-text-primary ml-1 font-medium"
              >
                {booking.booking_time?.substring(0, 5) || booking.time}
              </Typography>
            </View>

            {/* Количество гостей */}
            <View className="flex-row items-center mb-1">
              <Ionicons
                name="people-outline"
                size={16}
                color={Colors.primary[500]}
              />
              <Typography
                variant="body2"
                className="text-text-primary ml-1 font-medium"
              >
                {booking.number_of_guests || booking.guests}
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
});
