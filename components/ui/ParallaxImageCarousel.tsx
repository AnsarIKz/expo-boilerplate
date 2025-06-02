import { Image } from "expo-image";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";

interface ParallaxImageCarouselProps {
  images: string[];
  height?: number;
  maxScale?: number;
  scrollY?: Animated.Value;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const { width: screenWidth } = Dimensions.get("window");

export function ParallaxImageCarousel({
  images,
  height = 300,
  maxScale = 1.5,
  scrollY: externalScrollY,
  onScroll,
}: ParallaxImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const internalScrollY = useRef(new Animated.Value(0)).current;

  // Используем внешний scrollY если передан, иначе внутренний
  const scrollY = externalScrollY || internalScrollY;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / screenWidth);
      setCurrentIndex(index);

      // Передаем событие скролла наверх если нужно
      onScroll?.(event);
    },
    [onScroll]
  );

  if (!images.length) {
    return (
      <View
        className="bg-neutral-100 items-center justify-center"
        style={{ height }}
      >
        <View className="w-20 h-20 bg-neutral-200 rounded-lg" />
      </View>
    );
  }

  return (
    <View className="w-full h-full overflow-hidden">
      {/* Parallax Image Container */}
      <Animated.View
        className="w-full h-full"
        style={{
          transform: [
            {
              scale: scrollY.interpolate({
                inputRange: [-300, 0],
                outputRange: [maxScale, 1], // Только увеличение масштаба
                extrapolate: "clamp",
              }),
            },
          ],
        }}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={{
                width: screenWidth,
                height: "100%",
              }}
              contentFit="cover"
              placeholder="https://placehold.co/400x300/f0f0f0/cccccc?text=Загрузка..."
              transition={200}
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* Pagination Dots */}
      {images.length > 1 && (
        <View className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex-row gap-2">
          {images.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
