import { restaurantApi } from "@/lib/api/restaurant";
import { useBookingStore } from "@/stores/bookingStore";
import { useDeviceTokenStore } from "@/stores/deviceTokenStore";

// Mock the API
jest.mock("@/lib/api/restaurant", () => ({
  restaurantApi: {
    createBooking: jest.fn(),
    getBookings: jest.fn(),
    cancelBooking: jest.fn(),
  },
}));

// Mock device token store
jest.mock("@/stores/deviceTokenStore", () => ({
  useDeviceTokenStore: {
    getState: jest.fn(),
  },
}));

describe("Device Token Booking Integration", () => {
  const mockBookingRequest = {
    restaurantId: "restaurant-123",
    date: "2024-12-25",
    time: "19:00:00",
    guests: 4,
    comment: "Test booking",
  };

  const mockDjangoBooking = {
    id: "booking-123",
    restaurant: "restaurant-123",
    booking_date: "2024-12-25",
    booking_time: "19:00:00",
    number_of_guests: 4,
    status: "PENDING",
    special_requests: "Test booking",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset booking store
    useBookingStore.setState({
      bookings: [],
      isLoading: false,
      error: null,
    });
  });

  describe("createBooking with device token", () => {
    it("should register device token before creating booking", async () => {
      const mockDeviceTokenStore = {
        isRegistered: false,
        registerDevice: jest.fn().mockResolvedValue(undefined),
      };

      (useDeviceTokenStore.getState as jest.Mock).mockReturnValue(
        mockDeviceTokenStore
      );
      (restaurantApi.createBooking as jest.Mock).mockResolvedValue(
        mockDjangoBooking
      );

      const bookingStore = useBookingStore.getState();
      await bookingStore.addBooking(mockBookingRequest);

      expect(mockDeviceTokenStore.registerDevice).toHaveBeenCalled();
      expect(restaurantApi.createBooking).toHaveBeenCalled();
    });

    it("should not register device token if already registered", async () => {
      const mockDeviceTokenStore = {
        isRegistered: true,
        registerDevice: jest.fn(),
      };

      (useDeviceTokenStore.getState as jest.Mock).mockReturnValue(
        mockDeviceTokenStore
      );
      (restaurantApi.createBooking as jest.Mock).mockResolvedValue(
        mockDjangoBooking
      );

      const bookingStore = useBookingStore.getState();
      await bookingStore.addBooking(mockBookingRequest);

      expect(mockDeviceTokenStore.registerDevice).not.toHaveBeenCalled();
      expect(restaurantApi.createBooking).toHaveBeenCalled();
    });

    it("should handle device registration failure", async () => {
      const mockDeviceTokenStore = {
        isRegistered: false,
        registerDevice: jest
          .fn()
          .mockRejectedValue(new Error("Registration failed")),
      };

      (useDeviceTokenStore.getState as jest.Mock).mockReturnValue(
        mockDeviceTokenStore
      );

      const bookingStore = useBookingStore.getState();

      await expect(bookingStore.addBooking(mockBookingRequest)).rejects.toThrow(
        "Registration failed"
      );
    });
  });

  describe("loadBookings with device token", () => {
    it("should register device token before loading bookings", async () => {
      const mockDeviceTokenStore = {
        isRegistered: false,
        registerDevice: jest.fn().mockResolvedValue(undefined),
      };

      (useDeviceTokenStore.getState as jest.Mock).mockReturnValue(
        mockDeviceTokenStore
      );
      (restaurantApi.getBookings as jest.Mock).mockResolvedValue({
        results: [mockDjangoBooking],
      });

      const bookingStore = useBookingStore.getState();
      await bookingStore.loadBookings();

      expect(mockDeviceTokenStore.registerDevice).toHaveBeenCalled();
      expect(restaurantApi.getBookings).toHaveBeenCalled();
    });

    it("should not register device token if already registered", async () => {
      const mockDeviceTokenStore = {
        isRegistered: true,
        registerDevice: jest.fn(),
      };

      (useDeviceTokenStore.getState as jest.Mock).mockReturnValue(
        mockDeviceTokenStore
      );
      (restaurantApi.getBookings as jest.Mock).mockResolvedValue({
        results: [mockDjangoBooking],
      });

      const bookingStore = useBookingStore.getState();
      await bookingStore.loadBookings();

      expect(mockDeviceTokenStore.registerDevice).not.toHaveBeenCalled();
      expect(restaurantApi.getBookings).toHaveBeenCalled();
    });
  });

  describe("cancelBooking with device token", () => {
    it("should register device token before cancelling booking", async () => {
      const mockDeviceTokenStore = {
        isRegistered: false,
        registerDevice: jest.fn().mockResolvedValue(undefined),
      };

      (useDeviceTokenStore.getState as jest.Mock).mockReturnValue(
        mockDeviceTokenStore
      );
      (restaurantApi.cancelBooking as jest.Mock).mockResolvedValue({
        message: "Booking cancelled",
      });

      const bookingStore = useBookingStore.getState();
      await bookingStore.cancelBooking("booking-123");

      expect(mockDeviceTokenStore.registerDevice).toHaveBeenCalled();
      expect(restaurantApi.cancelBooking).toHaveBeenCalledWith("booking-123");
    });

    it("should not register device token if already registered", async () => {
      const mockDeviceTokenStore = {
        isRegistered: true,
        registerDevice: jest.fn(),
      };

      (useDeviceTokenStore.getState as jest.Mock).mockReturnValue(
        mockDeviceTokenStore
      );
      (restaurantApi.cancelBooking as jest.Mock).mockResolvedValue({
        message: "Booking cancelled",
      });

      const bookingStore = useBookingStore.getState();
      await bookingStore.cancelBooking("booking-123");

      expect(mockDeviceTokenStore.registerDevice).not.toHaveBeenCalled();
      expect(restaurantApi.cancelBooking).toHaveBeenCalledWith("booking-123");
    });
  });
});
