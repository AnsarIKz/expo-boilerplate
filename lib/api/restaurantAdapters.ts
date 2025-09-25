import { Restaurant } from "@/entities/Restaurant";
import { Booking } from "@/types/booking";
import { DjangoBooking, DjangoRestaurant } from "./restaurant";

/**
 * Адаптеры для преобразования Django Restaurant API ответов в наши типы данных
 */

// Функция для обработки URL изображений - убеждаемся что они абсолютные
const processImageUrl = (url: string): string => {
  if (!url) return "";

  // Если URL уже абсолютный, возвращаем как есть
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Если URL относительный, добавляем базовый URL API
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

// Функция для обработки изображений в новом формате API
const processImages = (
  djangoRestaurant: DjangoRestaurant
): { mainImage: string; allImages: string[] } => {
  const defaultImage =
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop";

  // Если есть детальные изображения (новый формат)
  if (djangoRestaurant.images && djangoRestaurant.images.length > 0) {
    const primaryImage = djangoRestaurant.images.find((img) => img.is_primary);
    const mainImageUrl =
      primaryImage?.image_url || djangoRestaurant.images[0].image_url;
    const mainImage = processImageUrl(mainImageUrl);
    const allImages = djangoRestaurant.images.map((img) =>
      processImageUrl(img.image_url)
    );
    return { mainImage, allImages };
  }

  // Если есть простые URL изображений (старый формат)
  if (djangoRestaurant.image_urls && djangoRestaurant.image_urls.length > 0) {
    const mainImage = processImageUrl(djangoRestaurant.image_urls[0]);
    const allImages = djangoRestaurant.image_urls.map(processImageUrl);
    return { mainImage, allImages };
  }

  return { mainImage: defaultImage, allImages: [defaultImage] };
};

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

  // Оставляем features как массив строк для отображения в карточке
  const featuresList = features;

  console.log("🏪 Django features:", features);
  console.log("🏪 Processed features:", featuresList);

  // Обработка изображений с поддержкой нового формата
  const { mainImage, allImages } = processImages(djangoRestaurant);

  // Безопасная обработка рабочих часов - поддерживаем строковый формат
  const openingHours = djangoRestaurant.opening_hours || {};

  // Отладочная информация для рабочих часов
  console.log("🕒 Django opening_hours:", openingHours);
  console.log("🕒 Django opening_hours type:", typeof openingHours);
  console.log("🕒 Django opening_hours keys:", Object.keys(openingHours));

  // Функция для нормализации времени работы
  const normalizeWorkingHours = (
    hours: string | { open: string; close: string } | undefined,
    defaultHours: string
  ): string => {
    if (!hours) {
      return defaultHours;
    }

    // Если это объект с open/close (новый формат Django)
    if (typeof hours === "object" && hours.open && hours.close) {
      return `${hours.open} - ${hours.close}`;
    }

    // Если это строка (старый формат)
    if (typeof hours === "string") {
      if (hours.trim() === "" || hours.toLowerCase() === "closed") {
        return defaultHours;
      }
      return hours.trim();
    }

    return defaultHours;
  };

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
    image: mainImage,
    images: allImages,
    rating: djangoRestaurant.average_rating || 0,
    reviewCount: djangoRestaurant.rating_count || 0,
    tags,
    location: {
      address: djangoRestaurant.address || "Адрес не указан",
      city: "Алматы", // По умолчанию
      district: "Центральный", // По умолчанию
    },
    workingHours: (() => {
      const normalizedHours = {
        monday: normalizeWorkingHours(openingHours.monday, "Не работает"),
        tuesday: normalizeWorkingHours(openingHours.tuesday, "Не работает"),
        wednesday: normalizeWorkingHours(openingHours.wednesday, "Не работает"),
        thursday: normalizeWorkingHours(openingHours.thursday, "Не работает"),
        friday: normalizeWorkingHours(openingHours.friday, "Не работает"),
        saturday: normalizeWorkingHours(openingHours.saturday, "Не работает"),
        sunday: normalizeWorkingHours(openingHours.sunday, "Не работает"),
      };
      console.log("🕒 Normalized working hours:", normalizedHours);
      return normalizedHours;
    })(),
    contact: {
      phone: djangoRestaurant.phone_number || "",
      email: djangoRestaurant.email || "",
      website: djangoRestaurant.website || "",
    },
    features: featuresList,
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
  return {
    id: djangoBooking.id,
    restaurant: djangoBooking.restaurant,
    user_name: djangoBooking.user_name,
    guest_name: djangoBooking.guest_name,
    booking_date: djangoBooking.booking_date,
    booking_time: djangoBooking.booking_time,
    number_of_guests: djangoBooking.number_of_guests,
    status: djangoBooking.status,
    created_at: djangoBooking.created_at,
    // Legacy fields for backward compatibility
    restaurantId: djangoBooking.restaurant.id,
    restaurantName: djangoBooking.restaurant.name,
    date: djangoBooking.booking_date,
    time: djangoBooking.booking_time.substring(0, 5), // "19:00:00" -> "19:00"
    guests: djangoBooking.number_of_guests,
    customerName: djangoBooking.guest_name || djangoBooking.user_name,
    customerPhone: "+7 xxx xxx xx xx",
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
  guest_name: string,
  guest_phone: string,
  comment?: string
) => {
  return {
    restaurant: restaurantId,
    booking_date: date,
    booking_time: time + ":00", // "19:00" -> "19:00:00"
    number_of_guests: guests,
    guest_name: guest_name,
    guest_phone: guest_phone,
    special_requests: comment || "",
  };
};
