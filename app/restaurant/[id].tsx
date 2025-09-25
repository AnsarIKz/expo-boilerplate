import { Colors } from "@/components/tokens";
import { BookingCreateModal } from "@/components/ui/BookingCreateModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ParallaxImageCarousel } from "@/components/ui/ParallaxImageCarousel";
import { RestaurantTags } from "@/components/ui/RestaurantTags";
import { Typography } from "@/components/ui/Typography";
import { Restaurant } from "@/entities/Restaurant";
import {
  useCreateBooking,
  useRestaurantApi,
} from "@/hooks/api/useRestaurantsApi";
import { useFavorites } from "@/hooks/useFavorites";
import { BookingRequest } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Функция для форматирования цены в стиле $$

// Функция для форматирования времени работы
const formatWorkingHours = (
  workingHours: Restaurant["workingHours"]
): string => {
  const today = new Date().getDay();
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const currentDay = days[today] as keyof typeof workingHours;

  // Отладочная информация
  console.log("🕒 Working hours data:", workingHours);
  console.log("🕒 Current day:", currentDay, "Day index:", today);

  // Получаем время для текущего дня
  const todayHours = workingHours[currentDay];
  console.log("🕒 Today hours:", todayHours);

  // Проверяем, работает ли сегодня
  if (todayHours === "Closed" || !todayHours || todayHours === "") {
    return "Закрыто сегодня";
  }

  // Форматируем время
  if (typeof todayHours === "string") {
    // Проверяем, что строка содержит корректный формат времени
    if (todayHours.includes("-")) {
      const [start, end] = todayHours.split("-");
      if (start && end) {
        return `Сегодня ${start.trim()}-${end.trim()}`;
      }
    }
    // Если формат неверный, показываем как есть
    return `Сегодня ${todayHours}`;
  } else if (
    todayHours &&
    typeof todayHours === "object" &&
    "open" in todayHours &&
    "close" in todayHours
  ) {
    return `Сегодня ${todayHours.open}-${todayHours.close}`;
  }

  return "Часы работы уточняйте";
};

// Функция для форматирования всех часов работы
const formatAllWorkingHours = (
  workingHours: Restaurant["workingHours"]
): string => {
  const days = [
    { key: "monday", label: "Понедельник" },
    { key: "tuesday", label: "Вторник" },
    { key: "wednesday", label: "Среда" },
    { key: "thursday", label: "Четверг" },
    { key: "friday", label: "Пятница" },
    { key: "saturday", label: "Суббота" },
    { key: "sunday", label: "Воскресенье" },
  ];

  return days
    .map(({ key, label }) => {
      const hours = workingHours[key as keyof typeof workingHours];
      if (!hours || hours === "Closed" || hours === "") {
        return `${label}: Закрыто`;
      }
      return `${label}: ${hours}`;
    })
    .join("\n");
};

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isLoading, error } = useRestaurantApi(id || "");
  const { isFavorite, toggleFavorite } = useFavorites();
  const createBookingMutation = useCreateBooking();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFullWorkingHours, setShowFullWorkingHours] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState(2);

  // Получаем безопасные отступы
  const insets = useSafeAreaInsets();

  // Анимированное значение для связи скролла с изображением
  const scrollY = useRef(new Animated.Value(0)).current;

  const isRestaurantFavorite = restaurant ? isFavorite(restaurant.id) : false;

  const handleFavoritePress = useCallback(() => {
    if (restaurant) {
      toggleFavorite(restaurant);
    }
  }, [restaurant, toggleFavorite]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, []);

  const handleSharePress = useCallback(async () => {
    if (!restaurant) return;

    try {
      await Share.share({
        message: `Посмотри на этот ресторан: ${restaurant.name}\n${restaurant.location.address}`,
        title: restaurant.name,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }, [restaurant]);

  const handleCallPress = useCallback(() => {
    if (restaurant?.contact.phone) {
      Linking.openURL(`tel:${restaurant.contact.phone}`);
    }
  }, [restaurant]);

  const handleMapsPress = useCallback(() => {
    if (restaurant?.location.coordinates) {
      const { latitude, longitude } = restaurant.location.coordinates;
      Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`);
    } else {
      const address = encodeURIComponent(restaurant?.location.address || "");
      Linking.openURL(`https://maps.google.com/?q=${address}`);
    }
  }, [restaurant]);

  const handleBookTablePress = useCallback(() => {
    setShowBookingModal(true);
  }, []);

  const handleBookingSubmit = useCallback(
    async (booking: BookingRequest) => {
      try {
        console.log("🎯 Создаем бронирование:", booking);

        // Используем только новый API для создания бронирования
        await createBookingMutation.mutateAsync({
          restaurantId: booking.restaurantId,
          date: booking.date,
          time: booking.time,
          guests: booking.guests,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          comment: booking.comment,
        });

        // Закрываем модальное окно
        setShowBookingModal(false);
      } catch (error) {
        console.error("❌ Ошибка создания бронирования:", error);
      }
    },
    [createBookingMutation, setShowBookingModal]
  );

  // Обработчик скролла для связи с изображением
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      scrollY.setValue(offsetY);
    },
    [scrollY]
  );

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background-cream">
        {/* Header skeleton */}
        <View
          className="absolute left-6 right-6 z-50 flex-row justify-between"
          style={{
            position: "absolute",
            top: insets.top + 16,
          }}
        >
          <View className="w-10 h-10 bg-neutral-200 rounded-full" />
          <View className="flex-row gap-3">
            <View className="w-10 h-10 bg-neutral-200 rounded-full" />
            <View className="w-10 h-10 bg-neutral-200 rounded-full" />
          </View>
        </View>

        {/* Image skeleton */}
        <View className="h-[350px] bg-neutral-200" />

        {/* Content skeleton */}
        <View className="flex-1 bg-background-cream" style={{ marginTop: -32 }}>
          <View className="rounded-t-3xl bg-background-secondary">
            <View className="px-4 py-4 bg-background-cream">
              {/* Name skeleton */}
              <View className="mb-3">
                <View className="h-8 bg-neutral-200 rounded w-3/4" />
              </View>

              {/* Rating skeleton */}
              <View className="flex-row items-center mb-4">
                <View className="h-4 bg-neutral-200 rounded w-20" />
              </View>

              {/* Tags skeleton */}
              <View className="flex-row gap-2 mb-4">
                <View className="h-6 bg-neutral-200 rounded-full w-16" />
                <View className="h-6 bg-neutral-200 rounded-full w-20" />
                <View className="h-6 bg-neutral-200 rounded-full w-14" />
              </View>
            </View>

            {/* Contact info skeleton */}
            <View className="mx-4 mb-4 bg-background-cream p-4 rounded-lg">
              <View className="flex-row items-start mb-3">
                <View className="w-5 h-5 bg-neutral-200 rounded" />
                <View className="ml-3 flex-1">
                  <View className="h-4 bg-neutral-200 rounded w-full mb-1" />
                  <View className="h-4 bg-neutral-200 rounded w-3/4" />
                </View>
              </View>
              <View className="flex-row items-center mb-3">
                <View className="w-5 h-5 bg-neutral-200 rounded" />
                <View className="ml-3 h-4 bg-neutral-200 rounded w-32" />
              </View>
            </View>
          </View>
        </View>

        {/* Bottom button skeleton */}
        <View className="absolute bottom-0 left-0 right-0 bg-background px-4 pb-6 pt-3 border-t border-border-light bg-background-cream">
          <SafeAreaView edges={["bottom"]}>
            <View className="h-12 bg-neutral-200 rounded-lg" />
          </SafeAreaView>
        </View>
      </View>
    );
  }

  // Error state
  if (error || !restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary items-center justify-center">
        <Typography variant="h6" className="text-text-secondary">
          {error ? "Ошибка загрузки ресторана" : "Ресторан не найден"}
        </Typography>
      </SafeAreaView>
    );
  }

  // Format price level based on priceRange
  const getPriceLevel = (priceRange?: "low" | "medium" | "high"): string => {
    switch (priceRange) {
      case "low":
        return "$";
      case "medium":
        return "$$";
      case "high":
        return "$$$";
      default:
        return "$$";
    }
  };

  const priceLevel = getPriceLevel(restaurant.priceRange);
  const workingHours = formatWorkingHours(restaurant.workingHours);
  const images = restaurant.images?.length
    ? restaurant.images
    : [restaurant.image];

  // Отладочная информация для фичей
  console.log("🏷️ Restaurant data in detail page:", {
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    features: restaurant.features,
    tags: restaurant.tags,
  });

  return (
    <View className="flex-1 bg-background-cream">
      {/* Header with Back Button - используем стандартные отступы */}
      <View
        className="absolute left-6 right-6 z-50 flex-row justify-between"
        style={{
          position: "absolute",
          top: insets.top + 16,
        }}
      >
        <TouchableOpacity
          className="w-10 h-10 bg-background-secondary/95 rounded-full items-center justify-center shadow-lg"
          onPress={handleBackPress}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.neutral[600]} />
        </TouchableOpacity>

        <View className="flex-row gap-3">
          <TouchableOpacity
            className="w-10 h-10 bg-background-secondary/95 rounded-full items-center justify-center shadow-lg"
            onPress={handleSharePress}
            activeOpacity={0.8}
          >
            <Ionicons
              name="share-outline"
              size={20}
              color={Colors.neutral[600]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-10 h-10 bg-background-secondary/95 rounded-full items-center justify-center shadow-lg"
            onPress={handleFavoritePress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isRestaurantFavorite ? "heart" : "heart-outline"}
              size={20}
              color={
                isRestaurantFavorite ? Colors.error.main : Colors.neutral[600]
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content with Parallax Header */}
      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Parallax Image Carousel as Header */}
        <Animated.View
          style={{
            height: scrollY.interpolate({
              inputRange: [-300, 0],
              outputRange: [600, 350],
              extrapolate: "clamp",
            }),
            marginTop: -50,
          }}
        >
          <ParallaxImageCarousel
            images={images}
            height={350}
            scrollY={scrollY}
            maxScale={1.2}
          />
        </Animated.View>

        {/* Content - используем Card компонент */}
        <View className="flex-1 bg-background-cream" style={{ marginTop: -32 }}>
          <Card
            variant="elevated"
            padding="none"
            className="rounded-t-3xl bg-background-secondary"
          >
            {/* Основной контент с правильными отступами */}
            <View className="px-4 py-4 bg-background-cream">
              {/* Restaurant Name */}
              <View className="mb-3">
                <Typography variant="h3" className="text-text-primary">
                  {restaurant.name}
                </Typography>
              </View>

              {/* Rating and Price */}
              <View className="flex-row items-center mb-4 bg-background-cream">
                <Ionicons name="star" size={16} color={Colors.star} />
                <Typography
                  variant="body1"
                  className="ml-1 text-text-primary font-medium"
                >
                  {restaurant.rating} ({restaurant.reviewCount})
                </Typography>
                <Typography
                  variant="body1"
                  className="ml-3 text-text-secondary"
                >
                  {priceLevel} • $$$
                </Typography>
              </View>

              {/* Tags */}
              <View className="mb-2 ">
                <RestaurantTags restaurant={restaurant} variant="detailed" />
              </View>
            </View>

            {/* Contact Info Card */}
            <Card
              variant="elevated"
              padding="md"
              className="mx-4 mb-4 bg-background-cream"
            >
              {/* Address */}
              <View className="flex-row items-start mb-3">
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={Colors.neutral[600]}
                />
                <Typography
                  variant="body2"
                  className="ml-3 flex-1 text-text-primary"
                >
                  {restaurant.location.address}
                </Typography>
              </View>

              {/* Working Hours */}
              <View className="flex-row items-start mb-3">
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={Colors.neutral[600]}
                  style={{ marginTop: 2 }}
                />
                <View className="ml-3 flex-1">
                  {showFullWorkingHours ? (
                    <Text className="text-text-primary text-sm leading-5">
                      {formatAllWorkingHours(restaurant.workingHours)}
                    </Text>
                  ) : (
                    <Typography variant="body2" className="text-text-primary">
                      {workingHours}
                    </Typography>
                  )}
                  {/* Показываем все дни недели при нажатии */}
                  <TouchableOpacity
                    onPress={() =>
                      setShowFullWorkingHours(!showFullWorkingHours)
                    }
                    activeOpacity={0.7}
                    className="mt-1"
                  >
                    <Typography variant="caption" color="primary">
                      {showFullWorkingHours
                        ? "Показать только сегодня"
                        : "Показать все часы работы"}
                    </Typography>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Phone */}
              {restaurant.contact.phone && (
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={handleCallPress}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={Colors.primary[500]}
                  />
                  <Typography variant="body2" className="ml-3 text-primary-500">
                    {restaurant.contact.phone}
                  </Typography>
                </TouchableOpacity>
              )}
            </Card>
            <View className="h-4 bg-black-500" />
            {/* About Section */}
            {restaurant.description && (
              <Card
                variant="elevated"
                padding="md"
                className="mx-4 mb-4 bg-background-cream"
              >
                <Typography variant="h5" className="text-text-primary mb-3">
                  О ресторане
                </Typography>

                <Typography
                  variant="body2"
                  className="text-text-primary leading-6"
                  numberOfLines={showFullDescription ? undefined : 3}
                >
                  {restaurant.description}
                </Typography>

                {restaurant.description.length > 150 && (
                  <TouchableOpacity
                    onPress={() => setShowFullDescription(!showFullDescription)}
                    activeOpacity={0.7}
                    className="mt-2"
                  >
                    <Typography variant="body2" color="primary">
                      {showFullDescription ? "Скрыть" : "Показать больше"}
                    </Typography>
                  </TouchableOpacity>
                )}
              </Card>
            )}

            {/* Дополнительный отступ для кнопки */}
            <View className="h-20" />
          </Card>
        </View>
      </Animated.ScrollView>

      {/* Fixed Bottom Button - используем стандартные отступы */}
      <View className="absolute bottom-0 left-0 right-0 bg-background px-4 pb-6 pt-3 border-t border-border-light bg-background-cream">
        <SafeAreaView edges={["bottom"]}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleBookTablePress}
            className="shadow-md"
          >
            <View className="flex-row items-center">
              <Text className="text-white ml-2 font-sf-pro font-medium text-base">
                Забронировать столик
              </Text>
            </View>
          </Button>
          {restaurant && (
            <BookingCreateModal
              visible={showBookingModal}
              onClose={() => setShowBookingModal(false)}
              restaurant={restaurant}
              onSubmit={handleBookingSubmit}
              initialGuests={selectedGuests}
              startStep="datetime"
            />
          )}
        </SafeAreaView>
      </View>

      {/* Booking Modal */}
    </View>
  );
}
