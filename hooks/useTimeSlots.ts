import { useRestaurantAvailability } from "@/hooks/api/useRestaurantsApi";
import { TimeSlot } from "@/types/booking";
import { useMemo } from "react";

/**
 * Хук для получения и управления временными слотами ресторана
 */
export const useTimeSlots = (restaurantId: string, date: string) => {
  const {
    data: availability,
    isLoading,
    error,
    refetch,
  } = useRestaurantAvailability(restaurantId, date);

  const timeSlots: TimeSlot[] = useMemo(() => {
    if (!availability?.available_slots) {
      return [];
    }

    return availability.available_slots.map((time) => ({
      time,
      available: true,
    }));
  }, [availability]);

  const isTimeAvailable = (time: string): boolean => {
    return timeSlots.some((slot) => slot.time === time && slot.available);
  };

  const getAvailableSlots = (): TimeSlot[] => {
    return timeSlots.filter((slot) => slot.available);
  };

  const hasAvailableSlots = timeSlots.length > 0;

  return {
    timeSlots,
    availableSlots: getAvailableSlots(),
    isLoading,
    error,
    hasAvailableSlots,
    isTimeAvailable,
    refetch,
    // Информация о ресторане из API
    restaurantInfo: availability
      ? {
          restaurantId: availability.restaurant_id,
          date: availability.date,
          dayOfWeek: availability.day_of_week,
          isOpen: availability.is_open,
          openingTime: availability.opening_time,
          closingTime: availability.closing_time,
        }
      : null,
  };
};
