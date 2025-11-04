import { Restaurant } from "@/entities/Restaurant";
import { Booking } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../tokens";
import { BookingCard } from "./BookingCard";
import { Typography } from "./Typography";

interface AllBookingsModalProps {
  visible: boolean;
  bookings: Booking[];
  onClose: () => void;
  onBookingPress: (booking: Booking) => void;
  getRestaurantById: (id: string) => Restaurant | undefined;
}

export function AllBookingsModal({
  visible,
  bookings,
  onClose,
  onBookingPress,
  getRestaurantById,
}: AllBookingsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background-primary">
        {/* Header */}
        <SafeAreaView>
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
            <Typography
              variant="h5"
              className="text-text-primary font-semibold"
            >
              Все бронирования
            </Typography>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={20} color={Colors.neutral[600]} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 20,
            paddingTop: 16,
          }}
        >
          {bookings.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons
                name="calendar-outline"
                size={64}
                color={Colors.neutral[300]}
              />
              <Typography
                variant="body1"
                className="text-text-secondary mt-4"
              >
                Нет бронирований
              </Typography>
            </View>
          ) : (
            bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                restaurant={getRestaurantById(booking.restaurant.id)}
                onPress={onBookingPress}
              />
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}



