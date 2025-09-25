import { restaurantApi } from "@/lib/api/restaurant";
import { adaptDjangoBookingToBooking } from "@/lib/api/restaurantAdapters";
import { useDeviceTokenStore } from "@/stores/deviceTokenStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Booking } from "../types/booking";

interface BookingStore {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadBookings: () => Promise<void>;
  getBookings: () => Booking[];
  getBookingById: (id: string) => Booking | undefined;
  cancelBooking: (id: string) => Promise<void>;
  clearBookings: () => void;
}

// Загрузка бронирований пользователя через Django API
const loadBookingsAPI = async (): Promise<Booking[]> => {
  console.log("📅 Loading bookings via Django API");

  try {
    // Ensure device token is registered before loading bookings
    const deviceTokenStore = useDeviceTokenStore.getState();
    if (!deviceTokenStore.deviceToken) {
      console.log("📱 Device not registered, registering now...");
      await deviceTokenStore.registerDevice();
    }

    const response = await restaurantApi.getBookings();
    const bookings = response.results.map(adaptDjangoBookingToBooking);

    console.log("✅ Bookings loaded successfully:", bookings.length);
    return bookings;
  } catch (error) {
    console.error("❌ Failed to load bookings:", error);
    throw error;
  }
};

// Отмена бронирования через Django API
const cancelBookingAPI = async (id: string): Promise<void> => {
  console.log("📅 Cancelling booking via Django API:", id);

  try {
    // Ensure device token is registered before cancelling booking
    const deviceTokenStore = useDeviceTokenStore.getState();
    if (!deviceTokenStore.deviceToken) {
      console.log("📱 Device not registered, registering now...");
      await deviceTokenStore.registerDevice();
    }

    await restaurantApi.cancelBooking(id);
    console.log("✅ Booking cancelled successfully");
  } catch (error) {
    console.error("❌ Failed to cancel booking:", error);
    throw error;
  }
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      bookings: [],
      isLoading: false,
      error: null,

      loadBookings: async () => {
        set({ isLoading: true, error: null });

        try {
          const bookings = await loadBookingsAPI();
          set({ bookings, isLoading: false });
        } catch (error) {
          console.error("❌ BookingStore - Error loading bookings:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load bookings",
          });
        }
      },

      getBookings: () => {
        return get().bookings;
      },

      getBookingById: (id: string) => {
        return get().bookings.find((booking) => booking.id === id);
      },

      cancelBooking: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          await cancelBookingAPI(id);

          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.id === id
                ? {
                    ...booking,
                    status: "CANCELLED",
                    updatedAt: new Date().toISOString(),
                  }
                : booking
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to cancel booking",
          });
          throw error;
        }
      },

      clearBookings: () => {
        set({ bookings: [] });
      },
    }),
    {
      name: "booking-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
