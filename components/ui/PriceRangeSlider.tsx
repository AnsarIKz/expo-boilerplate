import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";
import { PanResponder, View } from "react-native";
import { Typography } from "./Typography";

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  currentMin: number;
  currentMax: number;
  onRangeChange: (min: number, max: number) => void;
  onSliderActiveChange?: (isActive: boolean) => void;
}

const SLIDER_WIDTH = 280;
const THUMB_SIZE = 24;
const THUMB_TOUCH_SIZE = 44; // Увеличенная область для захвата
const TRACK_HEIGHT = 4;

export function PriceRangeSlider({
  minPrice,
  maxPrice,
  currentMin,
  currentMax,
  onRangeChange,
  onSliderActiveChange,
}: PriceRangeSliderProps) {
  // Преобразование цены в позицию на слайдере
  const priceToPosition = useCallback(
    (price: number) => {
      const ratio = (price - minPrice) / (maxPrice - minPrice);
      return ratio * SLIDER_WIDTH;
    },
    [minPrice, maxPrice]
  );

  // Преобразование позиции в цену
  const positionToPrice = useCallback(
    (position: number) => {
      const ratio = Math.max(0, Math.min(1, position / SLIDER_WIDTH));
      return Math.round(minPrice + ratio * (maxPrice - minPrice));
    },
    [minPrice, maxPrice]
  );

  const [leftPosition, setLeftPosition] = useState(priceToPosition(currentMin));
  const [rightPosition, setRightPosition] = useState(
    priceToPosition(currentMax)
  );
  const [activeThumb, setActiveThumb] = useState<"left" | "right" | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updatePrices = useCallback(
    (newLeftPos: number, newRightPos: number) => {
      const newMin = positionToPrice(newLeftPos);
      const newMax = positionToPrice(newRightPos);

      // Минимальный gap 1000₸
      if (newMax - newMin >= 1000) {
        onRangeChange(newMin, newMax);
      }
    },
    [positionToPrice, onRangeChange]
  );

  // Pan responder для левого ползунка
  const leftPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onShouldBlockNativeResponder: () => true,
    onPanResponderTerminationRequest: () => false,

    onPanResponderGrant: () => {
      setActiveThumb("left");
      setIsDragging(true);
      onSliderActiveChange?.(true);
      // Haptic feedback при захвате
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    onPanResponderMove: (evt, gestureState) => {
      if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
        // Горизонтальное движение - это наш ползунок
        const newPosition = Math.max(
          0,
          Math.min(rightPosition - 40, leftPosition + gestureState.dx)
        );
        setLeftPosition(newPosition);
        updatePrices(newPosition, rightPosition);
      }
    },

    onPanResponderRelease: () => {
      setActiveThumb(null);
      setIsDragging(false);
      onSliderActiveChange?.(false);
      // Haptic feedback при отпускании
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  // Pan responder для правого ползунка
  const rightPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onShouldBlockNativeResponder: () => true,
    onPanResponderTerminationRequest: () => false,

    onPanResponderGrant: () => {
      setActiveThumb("right");
      setIsDragging(true);
      onSliderActiveChange?.(true);
      // Haptic feedback при захвате
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    onPanResponderMove: (evt, gestureState) => {
      if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
        // Горизонтальное движение - это наш ползунок
        const newPosition = Math.max(
          leftPosition + 40,
          Math.min(SLIDER_WIDTH, rightPosition + gestureState.dx)
        );
        setRightPosition(newPosition);
        updatePrices(leftPosition, newPosition);
      }
    },

    onPanResponderRelease: () => {
      setActiveThumb(null);
      setIsDragging(false);
      onSliderActiveChange?.(false);
      // Haptic feedback при отпускании
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  return (
    <View className="px-4 py-6">
      <Typography variant="h6" className="font-semibold mb-6">
        Диапазон цен
      </Typography>

      {/* Визуальный слайдер */}
      <View className="items-center mb-6">
        <View
          className="relative"
          style={{ width: SLIDER_WIDTH, height: THUMB_TOUCH_SIZE }}
        >
          {/* Основная дорожка */}
          <View
            className="absolute bg-neutral-200 rounded-full"
            style={{
              top: (THUMB_TOUCH_SIZE - TRACK_HEIGHT) / 2,
              width: SLIDER_WIDTH,
              height: TRACK_HEIGHT,
            }}
          />

          {/* Активная дорожка */}
          <View
            className="absolute bg-primary-500 rounded-full"
            style={{
              top: (THUMB_TOUCH_SIZE - TRACK_HEIGHT) / 2,
              left: leftPosition,
              width: rightPosition - leftPosition,
              height: TRACK_HEIGHT,
            }}
          />

          {/* Левый ползунок - увеличенная область касания */}
          <View
            {...leftPanResponder.panHandlers}
            className="absolute items-center justify-center"
            style={{
              left: leftPosition - THUMB_TOUCH_SIZE / 2,
              top: 0,
              width: THUMB_TOUCH_SIZE,
              height: THUMB_TOUCH_SIZE,
            }}
          >
            {/* Видимый ползунок */}
            <View
              className={`bg-white rounded-full border-2 ${
                activeThumb === "left"
                  ? "border-primary-600 scale-110"
                  : "border-primary-500"
              } shadow-md`}
              style={{
                width: THUMB_SIZE,
                height: THUMB_SIZE,
              }}
            />
          </View>

          {/* Правый ползунок - увеличенная область касания */}
          <View
            {...rightPanResponder.panHandlers}
            className="absolute items-center justify-center"
            style={{
              left: rightPosition - THUMB_TOUCH_SIZE / 2,
              top: 0,
              width: THUMB_TOUCH_SIZE,
              height: THUMB_TOUCH_SIZE,
            }}
          >
            {/* Видимый ползунок */}
            <View
              className={`bg-white rounded-full border-2 ${
                activeThumb === "right"
                  ? "border-primary-600 scale-110"
                  : "border-primary-500"
              } shadow-md`}
              style={{
                width: THUMB_SIZE,
                height: THUMB_SIZE,
              }}
            />
          </View>
        </View>
      </View>

      {/* Подписи */}
      <View className="flex-row justify-between">
        <Typography variant="caption" className="text-text-secondary">
          {currentMin.toLocaleString()} ₸
        </Typography>
        <Typography variant="caption" className="text-text-secondary">
          {currentMax.toLocaleString()} ₸
        </Typography>
      </View>
    </View>
  );
}
