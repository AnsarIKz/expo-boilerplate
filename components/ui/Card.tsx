import { ReactNode } from "react";
import { TouchableOpacity, View } from "react-native";

export type CardVariant = "elevated" | "outlined" | "filled";
export type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  className?: string;
}

const getCardStyles = (variant: CardVariant, padding: CardPadding) => {
  const baseStyles = "rounded-xl";

  // Padding styles
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  // Variant styles
  const variantStyles = {
    elevated: "bg-background-cream",
    outlined: "bg-white border border-neutral-200",
    filled: "bg-neutral-50",
  };

  return `${baseStyles} ${paddingStyles[padding]} ${variantStyles[variant]}`;
};

export function Card({
  children,
  variant = "elevated",
  padding = "md",
  onPress,
  className = "",
}: CardProps) {
  const cardStyles = getCardStyles(variant, padding);

  if (onPress) {
    return (
      <TouchableOpacity
        className={`${cardStyles} ${className}`}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View className={`${cardStyles} ${className}`}>{children}</View>;
}
