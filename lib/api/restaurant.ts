import { apiClient } from "./config";
import { PaginatedResponse } from "./types";

// Django Restaurant API types according to documentation
export interface CuisineType {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

export interface RestaurantImage {
  id: string;
  image: string;
  alt_text: string;
  is_primary: boolean;
  uploaded_at: string;
}

export interface RestaurantRating {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface CuisineAssignment {
  id: string;
  cuisine_type: CuisineType;
  is_primary: boolean;
  created_at: string;
}

export interface DjangoRestaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone_number: string;
  email: string;
  website: string;
  cuisine: string[]; // Array of cuisine names for backward compatibility
  primary_cuisine_type: CuisineType;
  all_cuisine_types: CuisineType[];
  cuisine_assignments: CuisineAssignment[];
  average_rating: number;
  rating_count: number;
  price_range: "BUDGET" | "MODERATE" | "EXPENSIVE" | "VERY_EXPENSIVE";
  capacity: number;
  features: string[];
  opening_hours: {
    [key: string]: { open: string; close: string };
  };
  images: RestaurantImage[];
  ratings: RestaurantRating[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantFilters {
  cuisine?: string; // Filter by cuisine type name
  price_range?: "BUDGET" | "MODERATE" | "EXPENSIVE" | "VERY_EXPENSIVE";
  features?: string; // Filter by features like "WIFI", "PARKING", etc.
  search?: string; // Search by name or address
  min_rating?: number; // Minimum rating from 1.0 to 5.0
  page?: number; // Page number for pagination
  page_size?: number; // Page size for pagination (max 100)
}

export interface AvailabilityResponse {
  restaurant_id: string;
  date: string;
  day_of_week: string;
  opening_time: string;
  closing_time: string;
  available_slots: string[];
}

// Django Booking API types according to documentation
export interface DjangoBooking {
  id: string;
  restaurant:
    | string
    | { id: string; name: string; address?: string; phone?: string };
  booking_date: string;
  booking_time: string;
  number_of_guests: number; // Updated field name according to docs
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingRequest {
  restaurant: string;
  booking_date: string;
  booking_time: string;
  number_of_guests: number; // Updated field name
  special_requests?: string;
}

export interface UpdateBookingRequest {
  number_of_guests?: number; // Updated field name
  special_requests?: string;
}

// Django Bill API types according to documentation
export interface BillItem {
  name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface DjangoBill {
  id: string;
  booking: {
    id: string;
    restaurant: {
      id: string;
      name: string;
    };
    booking_date: string;
    guests_count: number;
  };
  items: BillItem[];
  subtotal: string;
  tax_amount: string;
  service_charge: string;
  total_amount: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  payment_method: string;
  created_at: string;
  paid_at?: string;
}

// Restaurant rating types
export interface CreateRatingRequest {
  rating: number;
  comment: string;
}

export interface MyRatingResponse {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const restaurantApi = {
  // Получение списка ресторанов
  getRestaurants: async (
    filters?: RestaurantFilters
  ): Promise<PaginatedResponse<DjangoRestaurant>> => {
    console.log("🍽️ Getting restaurants with filters:", filters);

    const params = new URLSearchParams();
    if (filters?.cuisine) params.append("cuisine", filters.cuisine);
    if (filters?.price_range) params.append("price_range", filters.price_range);
    if (filters?.features) params.append("features", filters.features);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.min_rating)
      params.append("min_rating", filters.min_rating.toString());
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size)
      params.append("page_size", filters.page_size.toString());

    const response = await apiClient.get(
      `/restaurant/restaurants/?${params.toString()}`
    );
    return response.data;
  },

  // Получение ресторана по ID
  getRestaurant: async (id: string): Promise<DjangoRestaurant> => {
    console.log("🍽️ Getting restaurant:", id);
    const response = await apiClient.get(`/restaurant/restaurants/${id}/`);
    return response.data;
  },

  // Проверка доступности ресторана
  getAvailability: async (
    restaurantId: string,
    date: string
  ): Promise<AvailabilityResponse> => {
    console.log(
      "📅 Getting availability for restaurant:",
      restaurantId,
      "date:",
      date
    );

    if (!date || !restaurantId) {
      throw new Error("Restaurant ID and date are required");
    }

    const response = await apiClient.get(
      `/restaurant/restaurants/${restaurantId}/availability/?date=${date}`
    );

    // Проверяем структуру ответа
    const data = response.data.data || response.data;

    if (!data || typeof data !== "object") {
      console.warn("Invalid availability response structure:", response.data);
      return {
        restaurant_id: restaurantId,
        date,
        day_of_week: "",
        opening_time: "",
        closing_time: "",
        available_slots: [],
      };
    }

    // Убеждаемся, что available_slots является массивом
    if (!Array.isArray(data.available_slots)) {
      console.warn("available_slots is not an array:", data.available_slots);
      data.available_slots = [];
    }

    console.log(`📅 Получены слоты для ${restaurantId} на ${date}:`, {
      dayOfWeek: data.day_of_week,
      workingHours: `${data.opening_time} - ${data.closing_time}`,
      slotsCount: data.available_slots.length,
      firstFewSlots: data.available_slots.slice(0, 3),
    });

    return data;
  },

  // Получение бронирований пользователя
  getBookings: async (): Promise<PaginatedResponse<DjangoBooking>> => {
    console.log("📅 Getting user bookings");
    const response = await apiClient.get("/restaurant/bookings/");
    return response.data;
  },

  // Создание бронирования
  createBooking: async (data: CreateBookingRequest): Promise<DjangoBooking> => {
    console.log("📅 Creating booking:", data);
    const response = await apiClient.post("/restaurant/bookings/", data);
    return response.data;
  },

  // Получение бронирования по ID
  getBooking: async (id: string): Promise<DjangoBooking> => {
    console.log("📅 Getting booking:", id);
    const response = await apiClient.get(`/restaurant/bookings/${id}/`);
    return response.data;
  },

  // Обновление бронирования
  updateBooking: async (
    id: string,
    data: UpdateBookingRequest
  ): Promise<DjangoBooking> => {
    console.log("📅 Updating booking:", id, data);
    const response = await apiClient.patch(`/restaurant/bookings/${id}/`, data);
    return response.data;
  },

  // Отмена бронирования
  cancelBooking: async (id: string): Promise<{ message: string }> => {
    console.log("📅 Cancelling booking:", id);
    const response = await apiClient.delete(`/restaurant/bookings/${id}/`);
    return response.data;
  },

  // Получение счетов пользователя
  getBills: async (): Promise<PaginatedResponse<DjangoBill>> => {
    console.log("🧾 Getting user bills");
    const response = await apiClient.get("/restaurant/bills/");
    return response.data;
  },

  // Получение счета по ID
  getBill: async (id: string): Promise<DjangoBill> => {
    console.log("🧾 Getting bill:", id);
    const response = await apiClient.get(`/restaurant/bills/${id}/`);
    return response.data;
  },

  // Получение списка типов кухонь
  getCuisineTypes: async (): Promise<PaginatedResponse<CuisineType>> => {
    console.log("🍽️ Getting cuisine types");
    const response = await apiClient.get("/restaurant/cuisine-types/");
    return response.data;
  },

  // Получение рейтингов ресторана
  getRestaurantRatings: async (
    restaurantId: string
  ): Promise<PaginatedResponse<RestaurantRating>> => {
    console.log("⭐ Getting restaurant ratings:", restaurantId);
    const response = await apiClient.get(
      `/restaurant/restaurants/${restaurantId}/ratings/`
    );
    return response.data;
  },

  // Создание рейтинга ресторана
  createRestaurantRating: async (
    restaurantId: string,
    data: CreateRatingRequest
  ): Promise<RestaurantRating> => {
    console.log("⭐ Creating restaurant rating:", restaurantId, data);
    const response = await apiClient.post(
      `/restaurant/restaurants/${restaurantId}/ratings/`,
      data
    );
    return response.data;
  },

  // Получение моего рейтинга ресторана
  getMyRestaurantRating: async (
    restaurantId: string
  ): Promise<{
    data: MyRatingResponse | null;
    statusCode: number;
    message: string;
  }> => {
    console.log("⭐ Getting my restaurant rating:", restaurantId);
    const response = await apiClient.get(
      `/restaurant/restaurants/${restaurantId}/my-rating/`
    );
    return response.data;
  },
};
