import { useEffect, useRef } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { Typography } from "./Typography";

interface TitleHeaderProps {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  showFloatingButtons?: boolean;
  onSearchPress?: () => void;
  onFilterPress?: () => void;
  centered?: boolean;
}

export function TitleHeader({
  title = "Страница",
  subtitle,
  onPress,
  showFloatingButtons = false,
  onSearchPress,
  onFilterPress,
}: TitleHeaderProps) {
  const leftButtonAnim = useRef(new Animated.Value(0)).current;
  const rightButtonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(leftButtonAnim, {
        toValue: showFloatingButtons ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rightButtonAnim, {
        toValue: showFloatingButtons ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showFloatingButtons, leftButtonAnim, rightButtonAnim]);

  //   if (centered) {
  //     return (
  //       <View className="items-center px-4 pt-2 pb-4">
  //         <Typography variant="h4" className="text-text-primary">
  //           {title}
  //         </Typography>
  //         {subtitle && (
  //           <Typography variant="body2" color="secondary" className="mt-1">
  //             {subtitle}
  //           </Typography>
  //         )}
  //       </View>
  //     );
  //   }

  return (
    <View className="flex-row items-center justify-center px-4 py-2">
      <TouchableOpacity
        className="items-center bg-transparent rounded-lg min-h-[40px] px-3 py-1"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Typography variant="body1" className="text-black font-semibold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="secondary" className="text-xs">
            {subtitle}
          </Typography>
        )}
      </TouchableOpacity>
    </View>
  );
}
