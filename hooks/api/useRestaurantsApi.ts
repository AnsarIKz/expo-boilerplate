import { Restaurant } from "@/entities/Restaurant";
import {
  CreateRatingRequest,
  restaurantApi,
  RestaurantFilters,
  UpdateBookingRequest,
} from "@/lib/api/restaurant";
import {
  adaptBookingRequestToDjango,
  adaptDjangoBookingToBooking,
  adaptDjangoRestaurantToRestaurant,
} from "@/lib/api/restaurantAdapters";
import { useToast } from "@/providers/ToastProvider";
import { Booking } from "@/types/booking";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Хук для получения списка ресторанов
export const useRestaurantsApi = (filters?: RestaurantFilters) => {
  return useQuery({
    queryKey: ["restaurants-api", filters],
    queryFn: async () => {
      try {
        console.log("🏪 Fetching restaurants from API...");
        const response = await restaurantApi.getRestaurants(filters);
        console.log("🏪 Raw API response:", response);

        if (!response.results || !Array.isArray(response.results)) {
          console.error("❌ Invalid API response structure:", response);
          throw new Error("Invalid API response structure");
        }

        console.log(`🏪 Processing ${response.results.length} restaurants...`);

        // Адаптируем каждый ресторан из Django формата в наш
        const restaurants: Restaurant[] = response.results.map(
          (djangoRestaurant, index) => {
            try {
              console.log(
                `🏪 Processing restaurant ${index + 1}:`,
                djangoRestaurant
              );
              const adaptedRestaurant =
                adaptDjangoRestaurantToRestaurant(djangoRestaurant);
              console.log(
                `✅ Successfully adapted restaurant ${index + 1}:`,
                adaptedRestaurant.name
              );
              return adaptedRestaurant;
            } catch (error) {
              console.error(
                `❌ Error adapting restaurant ${index + 1}:`,
                error
              );
              console.error("❌ Django restaurant data:", djangoRestaurant);
              throw error;
            }
          }
        );

        console.log(
          `🏪 Successfully processed ${restaurants.length} restaurants`
        );
        return restaurants;
      } catch (error) {
        console.error("❌ Error in useRestaurantsApi:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения ресторана по ID
export const useRestaurantApi = (id: string) => {
  return useQuery({
    queryKey: ["restaurant-api", id],
    queryFn: async () => {
      const response = await restaurantApi.getRestaurant(id);
      return adaptDjangoRestaurantToRestaurant(response);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для получения доступности ресторана
export const useRestaurantAvailability = (
  restaurantId: string,
  date: string
) => {
  return useQuery({
    queryKey: ["restaurant-availability", restaurantId, date],
    queryFn: () => restaurantApi.getAvailability(restaurantId, date),
    enabled: !!restaurantId && !!date,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

// Хук для получения бронирований пользователя
export const useBookingsApi = () => {
  return useQuery({
    queryKey: ["bookings-api"],
    queryFn: async () => {
      const response = await restaurantApi.getBookings();
      // Адаптируем каждое бронирование из Django формата в наш
      const bookings: Booking[] = response.results.map(
        adaptDjangoBookingToBooking
      );
      return bookings;
    },
    staleTime: 1 * 60 * 1000, // 1 минута
  });
};

// Хук для получения бронирования по ID
export const useBookingApi = (id: string) => {
  return useQuery({
    queryKey: ["booking-api", id],
    queryFn: async () => {
      const response = await restaurantApi.getBooking(id);
      return adaptDjangoBookingToBooking(response);
    },
    enabled: !!id,
  });
};

// Хук для создания бронирования
export const useCreateBooking = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      restaurantId: string;
      date: string;
      time: string;
      guests: number;
      customerName: string;
      customerPhone: string;
      comment?: string;
    }) => {
      const djangoRequest = adaptBookingRequestToDjango(
        data.restaurantId,
        data.date,
        data.time,
        data.guests,
        data.customerName,
        data.customerPhone,
        data.comment
      );
      const response = await restaurantApi.createBooking(djangoRequest);
      return adaptDjangoBookingToBooking(response);
    },
    onSuccess: (booking) => {
      showSuccess(
        "Бронирование создано",
        `Ваше бронирование на ${booking.booking_time.substring(
          0,
          5
        )} подтверждено`
      );

      // Инвалидируем запросы для обновления данных
      queryClient.invalidateQueries({ queryKey: ["bookings-api"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-availability"] });
    },
    onError: (error: any) => {
      console.error("❌ Create booking error:", error);

      let errorMessage = "Не удалось создать бронирование";
      if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message || "Неверные данные для бронирования";
      } else if (error.response?.status === 409) {
        errorMessage = "Выбранное время уже занято";
      }

      showError("Ошибка бронирования", errorMessage);
    },
  });
};

// Хук для обновления бронирования
export const useUpdateBooking = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; updates: UpdateBookingRequest }) => {
      const response = await restaurantApi.updateBooking(data.id, data.updates);
      return adaptDjangoBookingToBooking(response);
    },
    onSuccess: (booking) => {
      showSuccess("Бронирование обновлено", "Изменения сохранены");

      // Инвалидируем запросы для обновления данных
      queryClient.invalidateQueries({ queryKey: ["bookings-api"] });
      queryClient.invalidateQueries({ queryKey: ["booking-api", booking.id] });
    },
    onError: (error: any) => {
      console.error("❌ Update booking error:", error);
      showError("Ошибка", "Не удалось обновить бронирование");
    },
  });
};

// Хук для отмены бронирования
export const useCancelBooking = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restaurantApi.cancelBooking(id),
    onSuccess: () => {
      showSuccess(
        "Бронирование отменено",
        "Ваше бронирование успешно отменено"
      );

      // Инвалидируем запросы для обновления данных
      queryClient.invalidateQueries({ queryKey: ["bookings-api"] });
    },
    onError: (error: any) => {
      console.error("❌ Cancel booking error:", error);
      showError("Ошибка", "Не удалось отменить бронирование");
    },
  });
};

// Хук для получения счетов пользователя
export const useBillsApi = () => {
  return useQuery({
    queryKey: ["bills-api"],
    queryFn: () => restaurantApi.getBills(),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для получения счета по ID
export const useBillApi = (id: string) => {
  return useQuery({
    queryKey: ["bill-api", id],
    queryFn: () => restaurantApi.getBill(id),
    enabled: !!id,
  });
};

// Хук для получения типов кухонь
export const useCuisineTypes = () => {
  return useQuery({
    queryKey: ["cuisine-types"],
    queryFn: async () => {
      const response = await restaurantApi.getCuisineTypes();
      // Преобразуем в формат для фильтров
      return response.results.map((cuisine) => ({
        id: cuisine.slug,
        label: cuisine.name,
        isSelected: false,
      }));
    },
    staleTime: 30 * 60 * 1000, // 30 минут - типы кухонь редко меняются
    gcTime: 60 * 60 * 1000, // 1 час
  });
};

// Хук для получения удобств ресторанов
export const useRestaurantFeatures = () => {
  return useQuery({
    queryKey: ["restaurant-features"],
    queryFn: async () => {
      const response = await restaurantApi.getRestaurantFeatures();
      // Преобразуем в формат для фильтров
      return response.map((feature) => ({
        id: feature.value,
        label: feature.label,
        isSelected: false,
      }));
    },
    staleTime: 30 * 60 * 1000, // 30 минут - удобства редко меняются
    gcTime: 60 * 60 * 1000, // 1 час
  });
};

// Хук для получения рейтингов ресторана
export const useRestaurantRatings = (restaurantId: string) => {
  return useQuery({
    queryKey: ["restaurant-ratings", restaurantId],
    queryFn: () => restaurantApi.getRestaurantRatings(restaurantId),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для создания рейтинга ресторана
export const useCreateRestaurantRating = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      restaurantId: string;
      rating: number;
      comment: string;
    }) => {
      const ratingData: CreateRatingRequest = {
        rating: data.rating,
        comment: data.comment,
      };
      const response = await restaurantApi.createRestaurantRating(
        data.restaurantId,
        ratingData
      );
      return response;
    },
    onSuccess: (rating, variables) => {
      showSuccess("Отзыв добавлен", "Спасибо за ваш отзыв!");

      // Инвалидируем запросы для обновления данных
      queryClient.invalidateQueries({
        queryKey: ["restaurant-ratings", variables.restaurantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["restaurant-api", variables.restaurantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-restaurant-rating", variables.restaurantId],
      });
    },
    onError: (error: any) => {
      console.error("❌ Create restaurant rating error:", error);

      let errorMessage = "Не удалось добавить отзыв";
      if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message || "Неверные данные для отзыва";
      } else if (error.response?.status === 409) {
        errorMessage = "Вы уже оставили отзыв для этого ресторана";
      }

      showError("Ошибка", errorMessage);
    },
  });
};

// Хук для получения моего рейтинга ресторана
export const useMyRestaurantRating = (restaurantId: string) => {
  return useQuery({
    queryKey: ["my-restaurant-rating", restaurantId],
    queryFn: () => restaurantApi.getMyRestaurantRating(restaurantId),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};
