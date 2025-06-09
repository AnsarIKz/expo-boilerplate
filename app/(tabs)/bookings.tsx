import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BookingCard } from "@/components/ui/BookingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { TitleHeader } from "@/components/ui/TitleHeader";
import { Typography } from "@/components/ui/Typography";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useBookingStore } from "@/stores/bookingStore";
import { Booking } from "@/types/booking";

export default function BookingsScreen() {
  const { bookings, cancelBooking } = useBookingStore();
  const { data: restaurants = [] } = useRestaurants();
  const [refreshing, setRefreshing] = useState(false);

  // Сортировка бронирований по дате
  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [bookings]);

  // Группировка бронирований
  const groupedBookings = useMemo(() => {
    const upcoming = sortedBookings.filter((booking) => {
      const bookingDate = new Date(`${booking.date} ${booking.time}`);
      return bookingDate >= new Date() && booking.status === "confirmed";
    });

    const past = sortedBookings.filter((booking) => {
      const bookingDate = new Date(`${booking.date} ${booking.time}`);
      return bookingDate < new Date() || booking.status === "cancelled";
    });

    return { upcoming, past };
  }, [sortedBookings]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Симуляция обновления данных
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleBookingPress = useCallback((booking: Booking) => {
    // Здесь можно открыть детали бронирования
    console.log("Booking pressed:", booking);
  }, []);

  const handleCancelBooking = useCallback(
    (booking: Booking) => {
      Alert.alert(
        "Отменить бронирование",
        `Вы уверены, что хотите отменить бронирование в ${booking.restaurantName}?`,
        [
          { text: "Назад", style: "cancel" },
          {
            text: "Отменить",
            style: "destructive",
            onPress: () => {
              cancelBooking(booking.id);
              Alert.alert(
                "Бронирование отменено",
                "Ваше бронирование было успешно отменено."
              );
            },
          },
        ]
      );
    },
    [cancelBooking]
  );

  const getRestaurantById = useCallback(
    (id: string) => {
      return restaurants.find((r) => r.id === id);
    },
    [restaurants]
  );

  if (bookings.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary">
        <TitleHeader title="Бронирования" />

        <EmptyState
          title="Нет бронирований"
          subtitle="У вас пока нет забронированных столиков. Выберите ресторан и сделайте бронирование!"
          iconName="calendar-outline"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Header */}
      <TitleHeader title="Бронирования" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#bd561c"
            colors={["#bd561c"]}
          />
        }
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        {/* Предстоящие бронирования */}
        {groupedBookings.upcoming.length > 0 && (
          <View className="px-4 py-4">
            <View className="flex-row items-center mb-4">
              <Ionicons name="time-outline" size={20} color="#bd561c" />
              <Typography
                variant="h6"
                className="text-text-primary font-semibold ml-2"
              >
                Предстоящие
              </Typography>
            </View>

            <View className="space-y-3">
              {groupedBookings.upcoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  restaurant={getRestaurantById(booking.restaurantId)}
                  onPress={handleBookingPress}
                  onCancel={handleCancelBooking}
                  showActions={true}
                />
              ))}
            </View>
          </View>
        )}

        {/* Прошедшие/отмененные бронирования */}
        {groupedBookings.past.length > 0 && (
          <View className="px-4 py-4">
            <View className="flex-row items-center mb-4">
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#737373"
              />
              <Typography
                variant="h6"
                className="text-text-secondary font-semibold ml-2"
              >
                История
              </Typography>
            </View>

            <View className="space-y-3">
              {groupedBookings.past.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  restaurant={getRestaurantById(booking.restaurantId)}
                  onPress={handleBookingPress}
                  showActions={false}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
