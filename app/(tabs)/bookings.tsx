import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/components/tokens";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TitleHeader } from "@/components/ui/TitleHeader";
import { Typography } from "@/components/ui/Typography";
import { useBookingStore } from "@/stores/bookingStore";
import { Booking } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";

export default function BookingsScreen() {
  const { bookings, isLoading, cancelBooking } = useBookingStore();

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel your booking at ${booking.restaurantName}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            cancelBooking(booking.id);
            Alert.alert(
              "Booking Cancelled",
              "Your booking has been cancelled."
            );
          },
        },
      ]
    );
  };

  const renderBookingCard = (booking: Booking) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "confirmed":
          return "text-success-main";
        case "pending":
          return "text-warning-main";
        case "cancelled":
          return "text-error-main";
        default:
          return "text-neutral-500";
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case "confirmed":
          return "Confirmed";
        case "pending":
          return "Pending";
        case "cancelled":
          return "Cancelled";
        default:
          return status;
      }
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const canCancel =
      booking.status === "confirmed" || booking.status === "pending";
    const isPast = new Date(booking.date) < new Date();

    return (
      <Card
        key={booking.id}
        variant="elevated"
        padding="md"
        className="mx-4 mb-4"
      >
        <View className="flex-row justify-between items-start mb-3">
          <Typography variant="h6" className="flex-1 mr-2">
            {booking.restaurantName}
          </Typography>
          <Typography
            variant="caption"
            className={`font-medium ${getStatusColor(booking.status)}`}
          >
            {getStatusText(booking.status)}
          </Typography>
        </View>

        <View className="space-y-2 mb-4">
          <View className="flex-row items-center">
            <Ionicons
              name="calendar-outline"
              size={16}
              color={Colors.neutral[500]}
            />
            <Typography variant="body2" className="ml-2">
              {formatDate(booking.date)}
            </Typography>
          </View>

          <View className="flex-row items-center">
            <Ionicons
              name="time-outline"
              size={16}
              color={Colors.neutral[500]}
            />
            <Typography variant="body2" className="ml-2">
              {booking.time}
            </Typography>
          </View>

          <View className="flex-row items-center">
            <Ionicons
              name="people-outline"
              size={16}
              color={Colors.neutral[500]}
            />
            <Typography variant="body2" className="ml-2">
              {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
            </Typography>
          </View>

          {booking.customerName && (
            <View className="flex-row items-center">
              <Ionicons
                name="person-outline"
                size={16}
                color={Colors.neutral[500]}
              />
              <Typography variant="body2" className="ml-2">
                {booking.customerName}
              </Typography>
            </View>
          )}

          {booking.customerPhone && (
            <View className="flex-row items-center">
              <Ionicons
                name="call-outline"
                size={16}
                color={Colors.neutral[500]}
              />
              <Typography variant="body2" className="ml-2">
                {booking.customerPhone}
              </Typography>
            </View>
          )}

          {booking.comment && (
            <View className="flex-row items-start">
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color={Colors.neutral[500]}
                style={{ marginTop: 2 }}
              />
              <Typography variant="body2" className="ml-2 flex-1">
                {booking.comment}
              </Typography>
            </View>
          )}
        </View>

        {canCancel && !isPast && (
          <TouchableOpacity
            onPress={() => handleCancelBooking(booking)}
            className="mt-2 py-2 px-3 bg-error-light/10 rounded-lg border border-error-light"
            activeOpacity={0.7}
          >
            <Typography variant="body2" className="text-error-main text-center">
              Cancel Booking
            </Typography>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Header */}

      <TitleHeader title="Бронирования" />

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          bookings.length === 0 && !isLoading
            ? { flexGrow: 1, paddingBottom: 20 }
            : { paddingBottom: 20 }
        }
      >
        {isLoading ? (
          <LoadingSpinner text="Loading bookings..." />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            subtitle="Book a table at your favorite restaurant to see your reservations here"
            iconName="calendar-outline"
          />
        ) : (
          <View className="pt-2">{bookings.map(renderBookingCard)}</View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
