import { Image } from "expo-image";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";

interface ImageCarouselProps {
  images: string[];
  height?: number;
}

const { width: screenWidth } = Dimensions.get("window");

export function ImageCarousel({ images, height = 300 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / screenWidth);
      setCurrentIndex(index);
    },
    []
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
    <View className="relative">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="w-full"
        style={{ height }}
      >
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={{ width: screenWidth, height }}
            contentFit="cover"
            placeholder="https://placehold.co/400x300/f0f0f0/cccccc?text=Загрузка..."
            transition={200}
          />
        ))}
      </ScrollView>

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
