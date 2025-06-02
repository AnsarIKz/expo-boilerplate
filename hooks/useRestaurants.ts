import { Restaurant } from "@/entities/Restaurant";
import { useQuery } from "@tanstack/react-query";

// Mock API для ресторанов с расширенными данными
const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Del Papa",
    description:
      "Del Papa — это аутентичная итальянская кухня в самом сердце Алматы. Мы предлагаем уникальную и многогранную гастрономию, особенно для тех, кто любит и ценит настоящую итальянскую кухню. Наши повара используют только свежие ингредиенты и традиционные рецепты, передаваемые из поколения в поколение.",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop",
    ],
    rating: 4.4,
    reviewCount: 127,
    tags: [
      { id: "1", label: "Итальянская кухня", isPrimary: true },
      { id: "2", label: "Пицца", isPrimary: false },
      { id: "3", label: "Паста", isPrimary: false },
    ],
    location: {
      address: "ул. Абая 123",
      city: "Алматы",
      district: "Бостандыкский",
      coordinates: { latitude: 43.222, longitude: 76.8512 },
    },
    workingHours: {
      monday: "10:00-22:00",
      tuesday: "10:00-22:00",
      wednesday: "10:00-22:00",
      thursday: "10:00-22:00",
      friday: "10:00-23:00",
      saturday: "10:00-23:00",
      sunday: "11:00-22:00",
    },
    contact: {
      phone: "+7 727 123 45 67",
      email: "info@delpapa.kz",
      website: "https://delpapa.kz",
    },
    features: {
      hasDelivery: true,
      hasReservation: true,
      hasWifi: true,
      hasParking: true,
      hasChildMenu: true,
      hasVeganOptions: false,
      hasAlcohol: true,
      acceptsCards: true,
      averagePrice: { min: 3000, max: 8000, currency: "KZT" },
    },
    cuisine: ["Итальянская"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    isActive: true,
    isFavorite: false,
  },
  {
    id: "2",
    name: "Mama Mia",
    description:
      "Семейный ресторан Mama Mia создан для тех, кто ценит домашнюю атмосферу и традиционные рецепты. Здесь каждое блюдо готовится с любовью и заботой о качестве. Уютная обстановка и дружелюбный персонал сделают ваш визит особенным и незабываемым.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
    ],
    rating: 4.2,
    reviewCount: 89,
    tags: [
      { id: "1", label: "Итальянская кухня", isPrimary: true },
      { id: "2", label: "Пицца", isPrimary: false },
      { id: "3", label: "Ризотто", isPrimary: false },
    ],
    location: {
      address: "пр. Достык 456",
      city: "Алматы",
      district: "Медеуский",
    },
    workingHours: {
      monday: "11:00-21:00",
      tuesday: "11:00-21:00",
      wednesday: "11:00-21:00",
      thursday: "11:00-21:00",
      friday: "11:00-22:00",
      saturday: "11:00-22:00",
      sunday: "12:00-21:00",
    },
    contact: {
      phone: "+7 727 234 56 78",
      email: "contact@mamamia.kz",
    },
    features: {
      hasDelivery: true,
      hasReservation: false,
      hasWifi: true,
      hasParking: false,
      hasChildMenu: true,
      hasVeganOptions: true,
      hasAlcohol: false,
      acceptsCards: true,
      averagePrice: { min: 2500, max: 6000, currency: "KZT" },
    },
    cuisine: ["Итальянская"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
    isActive: true,
    isFavorite: true,
  },
  {
    id: "3",
    name: "Хачапури & Вино",
    description: "Лучшие грузинские блюда и отборные вина",
    image:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
    rating: 4.6,
    reviewCount: 203,
    tags: [
      { id: "1", label: "Грузинская кухня", isPrimary: true },
      { id: "2", label: "Хачапури", isPrimary: false },
      { id: "3", label: "Хинкали", isPrimary: false },
    ],
    location: {
      address: "ул. Толе би 789",
      city: "Алматы",
      district: "Алмалинский",
    },
    workingHours: {
      monday: "12:00-23:00",
      tuesday: "12:00-23:00",
      wednesday: "12:00-23:00",
      thursday: "12:00-23:00",
      friday: "12:00-00:00",
      saturday: "12:00-00:00",
      sunday: "12:00-23:00",
    },
    contact: {
      phone: "+7 727 345 67 89",
      website: "https://khachapuri.kz",
      socialMedia: {
        instagram: "@khachapuri_almaty",
      },
    },
    features: {
      hasDelivery: false,
      hasReservation: true,
      hasWifi: true,
      hasParking: true,
      hasChildMenu: false,
      hasVeganOptions: false,
      hasAlcohol: true,
      acceptsCards: true,
      averagePrice: { min: 4000, max: 12000, currency: "KZT" },
    },
    cuisine: ["Грузинская"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    isActive: true,
    isFavorite: false,
  },
  {
    id: "4",
    name: "Детский Мир",
    description: "Ресторан для всей семьи с детской игровой зоной",
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
    rating: 4.1,
    reviewCount: 156,
    tags: [
      { id: "1", label: "Детское меню", isPrimary: true },
      { id: "2", label: "Быстрая доставка", isPrimary: false },
      { id: "3", label: "Здоровая еда", isPrimary: false },
    ],
    location: {
      address: "ул. Жандосова 321",
      city: "Алматы",
      district: "Ауэзовский",
    },
    workingHours: {
      monday: "09:00-21:00",
      tuesday: "09:00-21:00",
      wednesday: "09:00-21:00",
      thursday: "09:00-21:00",
      friday: "09:00-22:00",
      saturday: "09:00-22:00",
      sunday: "10:00-21:00",
    },
    contact: {
      phone: "+7 727 456 78 90",
      email: "info@kidsworld.kz",
    },
    features: {
      hasDelivery: true,
      hasReservation: true,
      hasWifi: true,
      hasParking: true,
      hasChildMenu: true,
      hasVeganOptions: true,
      hasAlcohol: false,
      acceptsCards: true,
      averagePrice: { min: 1500, max: 4000, currency: "KZT" },
    },
    cuisine: ["Европейская", "Детская"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
    isActive: true,
    isFavorite: true,
  },
];

// Симуляция API запроса
const fetchRestaurants = async (
  searchQuery?: string
): Promise<Restaurant[]> => {
  // Симулируем задержку сети
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (searchQuery) {
    return mockRestaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.tags.some((tag) =>
          tag.label.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        restaurant.cuisine.some((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }

  return mockRestaurants;
};

// Хук для получения списка ресторанов
export const useRestaurants = (searchQuery?: string) => {
  return useQuery({
    queryKey: ["restaurants", searchQuery],
    queryFn: () => fetchRestaurants(searchQuery),
    enabled: true, // Всегда включен
  });
};

// Хук для получения ресторана по ID
export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const restaurant = mockRestaurants.find((r) => r.id === id);
      if (!restaurant) {
        throw new Error("Restaurant not found");
      }
      return restaurant;
    },
    enabled: !!id,
  });
};
