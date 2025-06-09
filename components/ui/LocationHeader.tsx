import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { Typography } from "./Typography";

interface LocationHeaderProps {
  city: string;
  onPress?: () => void;
  showFloatingButtons?: boolean;
  onSearchPress?: () => void;
  onFilterPress?: () => void;
  activeFiltersCount?: number;
}

export function LocationHeader({
  city,
  onPress,
  showFloatingButtons = false,
  onSearchPress,
  onFilterPress,
  activeFiltersCount = 0,
}: LocationHeaderProps) {
  const leftButtonAnim = useRef(new Animated.Value(0)).current;
  const rightButtonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(leftButtonAnim, {
        toValue: showFloatingButtons ? 1 : 0,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(rightButtonAnim, {
        toValue: showFloatingButtons ? 1 : 0,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showFloatingButtons, leftButtonAnim, rightButtonAnim]);

  return (
    <View className="flex-row items-center justify-between px-4 py-2">
      {/* Left animated button - Search */}
      <Animated.View
        style={{
          opacity: leftButtonAnim,
          transform: [
            {
              translateX: leftButtonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-60, 0],
              }),
            },
            {
              scale: leftButtonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
            {
              rotate: leftButtonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["-90deg", "0deg"],
              }),
            },
          ],
        }}
        pointerEvents={showFloatingButtons ? "auto" : "none"}
      >
        <TouchableOpacity
          className="w-10 h-10 bg-transparent rounded-full items-center justify-center"
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color="#000000" />
        </TouchableOpacity>
      </Animated.View>

      {/* Center - Location */}
      <TouchableOpacity
        className="flex-row items-center bg-transparent rounded-lg h-10 px-3"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name="location" size={16} color="#000000" />
        <Typography variant="body1" className="ml-2 text-black font-semibold">
          {city}
        </Typography>
      </TouchableOpacity>

      {/* Right animated button - Filters */}
      <Animated.View
        style={{
          opacity: rightButtonAnim,
          transform: [
            {
              translateX: rightButtonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [60, 0],
              }),
            },
            {
              scale: rightButtonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
            {
              rotate: rightButtonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["90deg", "0deg"],
              }),
            },
          ],
        }}
        pointerEvents={showFloatingButtons ? "auto" : "none"}
      >
        <TouchableOpacity
          className="w-10 h-10 bg-transparent rounded-full items-center justify-center relative"
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <Ionicons name="options" size={20} color="#000000" />
          {activeFiltersCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-primary-500 rounded-full w-5 h-5 items-center justify-center">
              <Typography
                variant="caption"
                color="inverse"
                className="text-white font-bold text-xs"
              >
                {activeFiltersCount}
              </Typography>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
