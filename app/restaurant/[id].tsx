import { Colors } from "@/components/tokens";
import { BookingModal } from "@/components/ui/BookingModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ParallaxImageCarousel } from "@/components/ui/ParallaxImageCarousel";
import { RestaurantTags } from "@/components/ui/RestaurantTags";
import { Typography } from "@/components/ui/Typography";
import { Restaurant } from "@/entities/Restaurant";
import { useFavorites } from "@/hooks/useFavorites";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useBookingStore } from "@/stores/bookingStore";
import { BookingRequest } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
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
const formatPriceLevel = (price: {
  min: number;
  max: number;
  currency: string;
}): string => {
  if (price.currency === "KZT") {
    const avgPrice = (price.min + price.max) / 2;
    if (avgPrice < 3000) return "$";
    if (avgPrice < 6000) return "$$";
    if (avgPrice < 10000) return "$$$";
    return "$$$$";
  }
  const avgPrice = (price.min + price.max) / 2;
  if (avgPrice < 15) return "$";
  if (avgPrice < 30) return "$$";
  if (avgPrice < 50) return "$$$";
  return "$$$$";
};

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

  // Получаем время для текущего дня
  const todayHours = workingHours[currentDay];

  // Проверяем, работает ли сегодня
  if (todayHours === "Closed" || !todayHours) {
    return "Закрыто сегодня";
  }

  // Форматируем время
  const [start, end] = todayHours.split("-");
  return `Сегодня ${start}-${end}`;
};

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurants = [] } = useRestaurants("");
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addBooking } = useBookingStore();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState(2);

  // Получаем безопасные отступы
  const insets = useSafeAreaInsets();

  // Анимированное значение для связи скролла с изображением
  const scrollY = useRef(new Animated.Value(0)).current;

  // Находим ресторан по ID
  const restaurant = useMemo(() => {
    return restaurants.find((r) => r.id === id);
  }, [restaurants, id]);

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
        await addBooking(booking);
        Alert.alert(
          "Booking Confirmed!",
          `Your table has been reserved for ${booking.guests} ${
            booking.guests === 1 ? "person" : "people"
          } on ${new Date(booking.date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })} at ${booking.time}.`,
          [{ text: "OK" }]
        );
      } catch (error) {
        Alert.alert(
          "Booking Failed",
          "Sorry, we couldn't process your booking. Please try again.",
          [{ text: "OK" }]
        );
      }
    },
    [addBooking]
  );

  // Обработчик скролла для связи с изображением
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      scrollY.setValue(offsetY);
    },
    [scrollY]
  );

  if (!restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary items-center justify-center">
        <Typography variant="h6" className="text-text-secondary">
          Ресторан не найден
        </Typography>
      </SafeAreaView>
    );
  }

  const priceLevel = formatPriceLevel(restaurant.features.averagePrice);
  const workingHours = formatWorkingHours(restaurant.workingHours);
  const images = restaurant.images?.length
    ? restaurant.images
    : [restaurant.image];

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
              <View className="flex-row items-center mb-3">
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={Colors.neutral[600]}
                />
                <Typography variant="body2" className="ml-3 text-text-primary">
                  {workingHours}
                </Typography>
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
        </SafeAreaView>
      </View>

      {/* Booking Modal */}
      {restaurant && (
        <BookingModal
          visible={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          restaurant={restaurant}
          onSubmit={handleBookingSubmit}
          initialGuests={selectedGuests}
          startStep="datetime"
        />
      )}
    </View>
  );
}
