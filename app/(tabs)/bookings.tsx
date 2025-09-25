import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BookingCard } from "@/components/ui/BookingCard";
import { BookingDetailsModal } from "@/components/ui/BookingModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TitleHeader } from "@/components/ui/TitleHeader";
import { Typography } from "@/components/ui/Typography";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useBookingStore } from "@/stores/bookingStore";
import { Booking } from "@/types/booking";

export default function BookingsScreen() {
  const { bookings, cancelBooking, loadBookings, isLoading } =
    useBookingStore();
  const { data: restaurants = [] } = useRestaurants();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Helper function to parse booking date and time
  const parseBookingDateTime = useCallback((date?: string, time?: string) => {
    try {
      if (!date || !time) {
        return new Date(); // Fallback to current date
      }

      // Handle different date formats
      let parsedDate: Date;

      if (date.includes("T")) {
        // ISO format
        parsedDate = new Date(date);
      } else {
        // Try to parse as YYYY-MM-DD format
        const dateTimeString = `${date} ${time}`;
        parsedDate = new Date(dateTimeString);
      }

      return parsedDate;
    } catch (error) {
      console.error(`❌ Error parsing date: ${date}, time: ${time}`, error);
      return new Date(); // Fallback to current date
    }
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("🔍 BookingsScreen - Current bookings:", bookings.length);
    console.log("🔍 BookingsScreen - Is loading:", isLoading);
  }, [bookings, isLoading]);

  // Загрузка бронирований при монтировании компонента
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Сортировка бронирований по дате
  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const dateA = parseBookingDateTime(
        a.booking_date || a.date,
        a.booking_time || a.time
      );
      const dateB = parseBookingDateTime(
        b.booking_date || b.date,
        b.booking_time || b.time
      );
      return dateB.getTime() - dateA.getTime();
    });
  }, [bookings, parseBookingDateTime]);

  // Группировка бронирований
  const groupedBookings = useMemo(() => {
    const now = new Date();

    const upcoming = sortedBookings.filter((booking) => {
      const bookingDate = parseBookingDateTime(
        booking.booking_date || booking.date,
        booking.booking_time || booking.time
      );
      return bookingDate >= now && booking.status === "CONFIRMED";
    });

    const past = sortedBookings.filter((booking) => {
      const bookingDate = parseBookingDateTime(
        booking.booking_date || booking.date,
        booking.booking_time || booking.time
      );
      return bookingDate < now || booking.status === "CANCELLED";
    });

    console.log(
      "🔍 Grouped bookings - Upcoming:",
      upcoming.length,
      "Past:",
      past.length
    );
    return { upcoming, past };
  }, [sortedBookings, parseBookingDateTime]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadBookings();
    } catch (error) {
      console.error("❌ Failed to refresh bookings:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadBookings]);

  const handleBookingPress = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  }, []);

  const handleCancelBooking = useCallback(
    async (booking: Booking) => {
      try {
        await cancelBooking(booking.id);
      } catch (error) {
        console.error("Failed to cancel booking:", error);
      }
    },
    [cancelBooking]
  );

  const handleRateRestaurant = useCallback(
    (booking: Booking, rating: number) => {
      // Здесь можно добавить логику отправки оценки на сервер
      console.log(`Rating ${rating} for restaurant ${booking.restaurant.name}`);
    },
    []
  );

  const getRestaurantById = useCallback(
    (id: string) => {
      return restaurants.find((r) => r.id === id);
    },
    [restaurants]
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedBooking(null);
  }, []);

  if (isLoading && bookings.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary">
        <TitleHeader title="Бронирования" />
        <View className="flex-1 justify-center items-center">
          <Typography variant="body1" className="text-text-secondary">
            Загрузка бронирований...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

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
        className="flex-1 px-4"
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
          paddingTop: 16,
        }}
      >
        {/* Debug: Show all bookings if grouping fails */}
        {groupedBookings.upcoming.length === 0 &&
          groupedBookings.past.length === 0 &&
          sortedBookings.length > 0 && (
            <View className="mb-6">
              {sortedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  restaurant={getRestaurantById(booking.restaurant.id)}
                  onPress={handleBookingPress}
                />
              ))}
            </View>
          )}

        {/* Предстоящие бронирования */}
        {groupedBookings.upcoming.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <Ionicons name="time-outline" size={20} color="#bd561c" />
              <Typography
                variant="h6"
                className="text-text-primary font-semibold ml-2"
              >
                Предстоящие
              </Typography>
            </View>

            {groupedBookings.upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                restaurant={getRestaurantById(booking.restaurant.id)}
                onPress={handleBookingPress}
              />
            ))}
          </View>
        )}

        {/* Прошедшие/отмененные бронирования */}
        {groupedBookings.past.length > 0 && (
          <View className="mb-6">
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

            {groupedBookings.past.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                restaurant={getRestaurantById(booking.restaurant.id)}
                onPress={handleBookingPress}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal для деталей бронирования */}
      <BookingDetailsModal
        visible={modalVisible}
        booking={selectedBooking}
        restaurant={
          selectedBooking
            ? getRestaurantById(selectedBooking.restaurant.id)
            : undefined
        }
        onClose={closeModal}
        onCancel={handleCancelBooking}
        onRate={handleRateRestaurant}
      />
    </SafeAreaView>
  );
}
