import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/components/tokens";
import { AllBookingsModal } from "@/components/ui/AllBookingsModal";
import { BookingCard } from "@/components/ui/BookingCard";
import { BookingDetailsModal } from "@/components/ui/BookingModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TitleHeader } from "@/components/ui/TitleHeader";
import { Typography } from "@/components/ui/Typography";
import {
  useBookingsApi,
  useCancelBooking,
} from "@/hooks/api/useRestaurantsApi";
import { useRestaurants } from "@/hooks/useRestaurants";
import { Booking } from "@/types/booking";

export default function BookingsScreen() {
  // Используем tanstack query вместо zustand store
  const { data: bookings = [], isLoading, refetch } = useBookingsApi();
  const { data: restaurants = [] } = useRestaurants();
  const cancelBookingMutation = useCancelBooking();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [allBookingsModalVisible, setAllBookingsModalVisible] = useState(false);

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
      return bookingDate >= now && booking.status !== "CANCELLED";
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
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleBookingPress = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  }, []);

  const handleCancelBooking = useCallback(
    async (booking: Booking) => {
      try {
        await cancelBookingMutation.mutateAsync(booking.id);
      } catch (error) {
        console.error("Failed to cancel booking:", error);
      }
    },
    [cancelBookingMutation]
  );

  const handleRateRestaurant = useCallback(
    (booking: Booking, rating: number) => {
      // Здесь можно добавить логику отправки оценки на сервер
      console.log(`Rating ${rating} for restaurant ${booking.restaurant.name}`);
    },
    []
  );

  const getRestaurantById = (id: string) => {
    return restaurants.find((r) => r.id === id);
  };

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

  if (groupedBookings.upcoming.length === 0) {
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
    <SafeAreaView className="h-full bg-background-primary pb-12">
      {/* Header */}
      <TitleHeader title="Бронирования" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary[500]}
            colors={[Colors.primary[500]]}
          />
        }
        contentContainerStyle={{
          paddingBottom: 20,
          paddingTop: 16,
        }}
      >
        {/* Предстоящие бронирования */}
        {groupedBookings.upcoming.length > 0 && (
          <>
            {groupedBookings.upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                restaurant={getRestaurantById(booking.restaurant.id)}
                onPress={handleBookingPress}
              />
            ))}
          </>
        )}

        {/* Ссылка на все бронирования */}
        {/* {sortedBookings.length > 0 && (
          <View className="px-4">
            <TouchableOpacity
              onPress={() => setAllBookingsModalVisible(true)}
              className="flex-row items-center py-3"
            >
              <Typography
                variant="body1"
                className="text-primary-main font-medium"
              >
                История бронирований
              </Typography>
            </TouchableOpacity>
          </View>
        )} */}
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

      {/* Modal для всех бронирований */}
      <AllBookingsModal
        visible={allBookingsModalVisible}
        bookings={sortedBookings}
        onClose={() => setAllBookingsModalVisible(false)}
        onBookingPress={handleBookingPress}
        getRestaurantById={getRestaurantById}
      />
    </SafeAreaView>
  );
}
