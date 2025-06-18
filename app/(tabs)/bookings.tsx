import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/components/tokens";
import { BookingCard } from "@/components/ui/BookingCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Typography } from "@/components/ui/Typography";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useBookingStore } from "@/stores/bookingStore";
import { Booking } from "@/types/booking";

// Компонент заголовка секции
const SectionHeader = ({
  icon,
  title,
  count,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  count: number;
}) => (
  <Card variant="ghost" padding="md" className="mx-4 mb-3">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center mr-3">
          <Ionicons name={icon} size={16} color={Colors.primary[500]} />
        </View>
        <Typography variant="h6" className="text-text-primary">
          {title}
        </Typography>
      </View>
      <View className="bg-primary-100 px-2 py-1 rounded-full">
        <Typography variant="caption" className="text-primary-500 font-medium">
          {count}
        </Typography>
      </View>
    </View>
  </Card>
);

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleBookingPress = useCallback((booking: Booking) => {
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
      <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
        {/* Header */}
        <View className="px-4 pb-4 border-b border-border-light">
          <Typography variant="h4" className="text-text-primary">
            Бронирования
          </Typography>
        </View>

        <EmptyState
          title="Нет бронирований"
          subtitle="У вас пока нет забронированных столиков. Выберите ресторан и сделайте бронирование!"
          iconName="calendar-outline"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pb-4 border-b border-border-light">
        <Typography variant="h4" className="text-text-primary">
          Бронирования
        </Typography>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary[500]}
            colors={[Colors.primary[500]]}
          />
        }
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      >
        {/* Предстоящие бронирования */}
        {groupedBookings.upcoming.length > 0 && (
          <View className="mb-6">
            <SectionHeader
              icon="time-outline"
              title="Предстоящие"
              count={groupedBookings.upcoming.length}
            />

            <View className="px-4 space-y-3">
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
          <View>
            <SectionHeader
              icon="checkmark-circle-outline"
              title="История"
              count={groupedBookings.past.length}
            />

            <View className="px-4 space-y-3">
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
