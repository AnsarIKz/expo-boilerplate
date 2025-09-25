import { DimensionValue, View, ViewStyle } from "react-native";
import { Colors } from "../tokens";

interface ImageSkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
}

export function ImageSkeleton({
  width = "100%",
  height = 240,
  borderRadius = 16,
}: ImageSkeletonProps) {
  const style: ViewStyle = {
    width,
    height,
    backgroundColor: Colors.neutral[200],
    borderRadius,
  };

  return <View style={style} className="animate-pulse" />;
}
