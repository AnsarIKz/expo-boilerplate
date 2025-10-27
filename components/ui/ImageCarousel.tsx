import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
import { Typography } from "./Typography";

interface ImageCarouselProps {
  images: string[];
  height?: number;
}

const { width: screenWidth } = Dimensions.get("window");

export function ImageCarousel({ images, height = 300 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState<boolean[]>(
    new Array(images.length).fill(true)
  );
  const scrollViewRef = useRef<ScrollView>(null);

  // Обновляем массив loading состояний при изменении images
  useEffect(() => {
    setImageLoading(new Array(images.length).fill(true));
  }, [images.length]);

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
        <Typography variant="body1" className="text-neutral-500">
          Нет изображений
        </Typography>
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
          <View key={index} style={{ width: screenWidth, height }}>
            <Image
              source={{ uri: image }}
              style={{
                width: screenWidth,
                height,
                position: imageLoading[index] ? "absolute" : "relative",
                opacity: imageLoading[index] ? 0 : 1,
              }}
              contentFit="cover"
              onLoadStart={() => {
                setImageLoading((prev) => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                });
              }}
              onLoadEnd={() => {
                setImageLoading((prev) => {
                  const newState = [...prev];
                  newState[index] = false;
                  return newState;
                });
              }}
              onError={() => {
                setImageLoading((prev) => {
                  const newState = [...prev];
                  newState[index] = false;
                  return newState;
                });
              }}
              transition={200}
            />
          </View>
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
