import { restaurantApi } from "@/lib/api/restaurant";
import {
  adaptBookingRequestToDjango,
  adaptDjangoBookingToBooking,
} from "@/lib/api/restaurantAdapters";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Booking, BookingRequest } from "../types/booking";

interface BookingStore {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addBooking: (bookingRequest: BookingRequest) => Promise<Booking>;
  loadBookings: () => Promise<void>;
  getBookings: () => Booking[];
  getBookingById: (id: string) => Booking | undefined;
  cancelBooking: (id: string) => Promise<void>;
  clearBookings: () => void;
}

// Real API function using Django backend
const createBookingAPI = async (request: BookingRequest): Promise<Booking> => {
  console.log("📅 Creating booking via Django API:", request);

  try {
    // Адаптируем наш запрос в формат Django API
    const djangoRequest = adaptBookingRequestToDjango(
      request.restaurantId,
      request.date,
      request.time,
      request.guests,
      request.comment
    );

    // Вызываем Django API
    const response = await restaurantApi.createBooking(djangoRequest);

    // Адаптируем ответ Django в наш формат
    const booking = adaptDjangoBookingToBooking(response);

    console.log("✅ Booking created successfully:", booking);
    return booking;
  } catch (error) {
    console.error("❌ Booking creation failed:", error);
    throw error;
  }
};

// Загрузка бронирований пользователя через Django API
const loadBookingsAPI = async (): Promise<Booking[]> => {
  console.log("📅 Loading bookings via Django API");

  try {
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
    await restaurantApi.cancelBooking(id);
    console.log("✅ Booking cancelled successfully");
  } catch (error) {
    console.error("❌ Failed to cancel booking:", error);
    throw error;
  }
};

// Get restaurant name by ID (fallback for compatibility)
const getRestaurantName = (restaurantId: string): string => {
  const restaurantNames: Record<string, string> = {
    "1": "Del Papa",
    "2": "Mama Mia",
    "3": "Хачапури & Вино",
    "4": "Детский Мир",
  };

  return restaurantNames[restaurantId] || "Unknown Restaurant";
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      bookings: [],
      isLoading: false,
      error: null,

      addBooking: async (bookingRequest: BookingRequest) => {
        set({ isLoading: true, error: null });

        try {
          const booking = await createBookingAPI(bookingRequest);

          set((state) => ({
            bookings: [booking, ...state.bookings],
            isLoading: false,
          }));

          return booking;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Booking failed",
          });
          throw error;
        }
      },

      loadBookings: async () => {
        set({ isLoading: true, error: null });

        try {
          const bookings = await loadBookingsAPI();
          set({ bookings, isLoading: false });
        } catch (error) {
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
                    status: "cancelled",
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
