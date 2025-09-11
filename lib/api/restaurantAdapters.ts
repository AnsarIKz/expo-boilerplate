import { Restaurant } from "@/entities/Restaurant";
import { Booking } from "@/types/booking";
import { DjangoBooking, DjangoRestaurant } from "./restaurant";

/**
 * Адаптеры для преобразования Django Restaurant API ответов в наши типы данных
 */

// Мапинг Django ресторана в наш формат
export const adaptDjangoRestaurantToRestaurant = (
  djangoRestaurant: DjangoRestaurant
): Restaurant => {
  // Мапинг price_range из Django формата в наш
  const priceRangeMap: { [key: string]: "low" | "medium" | "high" } = {
    BUDGET: "low",
    MODERATE: "medium",
    EXPENSIVE: "high",
    VERY_EXPENSIVE: "high",
  };

  // Создаем теги на основе кухни и особенностей - с проверкой на null/undefined
  const primaryCuisineName =
    djangoRestaurant.primary_cuisine_type?.name ||
    (djangoRestaurant.cuisine && djangoRestaurant.cuisine.length > 0
      ? djangoRestaurant.cuisine[0]
      : "Ресторан");

  // Безопасное создание тегов с проверкой на существование features
  const features = djangoRestaurant.features || [];
  const tags = [
    { id: "cuisine", label: primaryCuisineName, isPrimary: true },
    ...features.map((feature, index) => ({
      id: `feature-${index}`,
      label: feature,
      isPrimary: false,
    })),
  ];

  // Преобразуем features из массива строк в объект булевых значений
  const featuresObj = {
    hasDelivery: features.includes("DELIVERY"),
    hasReservation: features.includes("RESERVATIONS"),
    hasWifi: features.includes("WIFI"),
    hasParking: features.includes("PARKING"),
    hasChildMenu: features.includes("VEGETARIAN_OPTIONS"),
    hasVeganOptions: features.includes("VEGAN_OPTIONS"),
    hasAlcohol: features.includes("LIVE_MUSIC"),
    acceptsCards: features.includes("TAKEOUT"),
    averagePrice: { min: 2000, max: 8000, currency: "KZT" }, // Примерные значения
  };

  // Безопасная обработка изображений
  const images = djangoRestaurant.images || [];
  const defaultImage =
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop";

  // Безопасная обработка рабочих часов
  const openingHours = djangoRestaurant.opening_hours || {};

  // Безопасная обработка типов кухни
  const cuisineTypes = djangoRestaurant.all_cuisine_types || [];
  const cuisine =
    djangoRestaurant.cuisine && djangoRestaurant.cuisine.length > 0
      ? djangoRestaurant.cuisine
      : cuisineTypes.length > 0
      ? cuisineTypes.map((ct) => ct.name)
      : ["Ресторан"];

  return {
    id: djangoRestaurant.id,
    name: djangoRestaurant.name || "Ресторан",
    description: djangoRestaurant.description || "Описание отсутствует",
    image:
      images.length > 0
        ? images.find((img) => img.is_primary)?.image || images[0].image
        : defaultImage,
    images: images.length > 0 ? images.map((img) => img.image) : [defaultImage],
    rating: djangoRestaurant.average_rating || 0,
    reviewCount: djangoRestaurant.rating_count || 0,
    tags,
    location: {
      address: djangoRestaurant.address || "Адрес не указан",
      city: "Алматы", // По умолчанию
      district: "Центральный", // По умолчанию
    },
    workingHours: {
      monday: openingHours.monday
        ? `${openingHours.monday.open}-${openingHours.monday.close}`
        : "10:00-22:00", // По умолчанию
      tuesday: openingHours.tuesday
        ? `${openingHours.tuesday.open}-${openingHours.tuesday.close}`
        : "10:00-22:00",
      wednesday: openingHours.wednesday
        ? `${openingHours.wednesday.open}-${openingHours.wednesday.close}`
        : "10:00-22:00",
      thursday: openingHours.thursday
        ? `${openingHours.thursday.open}-${openingHours.thursday.close}`
        : "10:00-22:00",
      friday: openingHours.friday
        ? `${openingHours.friday.open}-${openingHours.friday.close}`
        : "10:00-23:00",
      saturday: openingHours.saturday
        ? `${openingHours.saturday.open}-${openingHours.saturday.close}`
        : "10:00-23:00",
      sunday: openingHours.sunday
        ? `${openingHours.sunday.open}-${openingHours.sunday.close}`
        : "11:00-22:00",
    },
    contact: {
      phone: djangoRestaurant.phone_number || "",
      email: djangoRestaurant.email || "",
      website: djangoRestaurant.website || "",
    },
    features: featuresObj,
    cuisine,
    createdAt: djangoRestaurant.created_at,
    updatedAt: djangoRestaurant.updated_at,
    isActive: djangoRestaurant.is_active !== false, // По умолчанию true
    isFavorite: false, // Будет определяться отдельно
    priceRange: priceRangeMap[djangoRestaurant.price_range] || "medium",
  };
};

// Мапинг Django бронирования в наш формат
export const adaptDjangoBookingToBooking = (
  djangoBooking: DjangoBooking
): Booking => {
  const restaurantName =
    typeof djangoBooking.restaurant === "string"
      ? "Неизвестный ресторан"
      : djangoBooking.restaurant.name;

  const restaurantId =
    typeof djangoBooking.restaurant === "string"
      ? djangoBooking.restaurant
      : djangoBooking.restaurant.id;

  // Мапинг статусов
  const statusMap: { [key: string]: "confirmed" | "pending" | "cancelled" } = {
    CONFIRMED: "confirmed",
    PENDING: "pending",
    CANCELLED: "cancelled",
    COMPLETED: "confirmed", // Завершенные бронирования показываем как подтвержденные
  };

  return {
    id: djangoBooking.id,
    restaurantId,
    restaurantName,
    date: djangoBooking.booking_date,
    time: djangoBooking.booking_time.substring(0, 5), // "19:00:00" -> "19:00"
    guests: djangoBooking.number_of_guests,
    status: statusMap[djangoBooking.status] || "pending",
    customerName: "Пользователь", // Django API не предоставляет имя пользователя в бронировании
    customerPhone: "+7 xxx xxx xx xx", // Заглушка
    comment: djangoBooking.special_requests,
    createdAt: djangoBooking.created_at,
    updatedAt: djangoBooking.updated_at,
  };
};

// Преобразование из нашего формата в Django для создания бронирования
export const adaptBookingRequestToDjango = (
  restaurantId: string,
  date: string,
  time: string,
  guests: number,
  comment?: string
) => {
  return {
    restaurant: restaurantId,
    booking_date: date,
    booking_time: time + ":00", // "19:00" -> "19:00:00"
    number_of_guests: guests,
    special_requests: comment || "",
  };
};
