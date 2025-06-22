import { Restaurant } from "@/entities/Restaurant";
import { Booking } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { Image, View } from "react-native";
import { Colors } from "../tokens";
import { Card } from "./Card";
import { Typography } from "./Typography";

interface BookingCardProps {
  booking: Booking;
  restaurant?: Restaurant;
  onPress?: (booking: Booking) => void;
}

export function BookingCard({
  booking,
  restaurant,
  onPress,
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

  // Цвет статуса
  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return Colors.success.main;
      case "pending":
        return Colors.warning.main;
      case "cancelled":
        return Colors.neutral[400];
      default:
        return Colors.neutral[500];
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
      className="overflow-hidden mb-4"
    >
      <View className="flex-row">
        {/* Изображение ресторана */}
        <View className="w-24 h-24 relative m-3">
          <Image
            source={{ uri: restaurantImage }}
            className="w-full h-full rounded-xl"
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
        <View className="flex-1 p-4 pl-0">
          {/* Название и адрес */}
          <View className="mb-3">
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
                {formatDate(booking.date)}
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
                {booking.time}
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
                {booking.guests}
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
}
