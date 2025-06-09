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
  getBookings: () => Booking[];
  getBookingById: (id: string) => Booking | undefined;
  cancelBooking: (id: string) => void;
  clearBookings: () => void;
}

// Mock function to simulate API call
const createBookingAPI = async (request: BookingRequest): Promise<Booking> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate random success/failure
  if (Math.random() < 0.1) {
    // 10% chance of failure
    throw new Error("Booking failed");
  }

  const booking: Booking = {
    id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...request,
    restaurantName: getRestaurantName(request.restaurantId),
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return booking;
};

// Get restaurant name by ID (in real app this would be a proper API call)
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

          // Add restaurant name for convenience
          const bookingWithRestaurantName: Booking = {
            ...booking,
            restaurantName: getRestaurantName(booking.restaurantId),
          };

          set((state) => ({
            bookings: [bookingWithRestaurantName, ...state.bookings],
            isLoading: false,
          }));

          return bookingWithRestaurantName;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Booking failed",
          });
          throw error;
        }
      },

      getBookings: () => {
        return get().bookings;
      },

      getBookingById: (id: string) => {
        return get().bookings.find((booking) => booking.id === id);
      },

      cancelBooking: (id: string) => {
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
        }));
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
