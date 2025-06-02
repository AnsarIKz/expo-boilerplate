import { ReactNode } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../tokens";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  fullWidth?: boolean;
  className?: string;
}

const getButtonStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean
) => {
  const baseStyles =
    "flex-row items-center justify-center rounded-xl shadow-sm";

  // Size styles - как в SearchBar
  const sizeStyles = {
    sm: "px-3 h-[36px]", // Маленький размер
    md: "px-4 h-[42px]", // Средний размер
    lg: "px-4 h-[46px]", // Как SearchBar - px-4 py-3 h-[46px]
  };

  // Variant styles - как SearchBar
  const variantStyles = {
    primary: disabled
      ? "bg-neutral-300 border border-neutral-300"
      : "bg-primary-500 border border-primary-500",
    secondary: disabled
      ? "bg-neutral-200 border border-neutral-300"
      : "bg-white border border-neutral-400",
    outline: disabled
      ? "border border-neutral-300 bg-white"
      : "border border-neutral-400 bg-white",
    ghost: "bg-transparent border-0",
  };

  return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;
};

const getTextStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean
) => {
  const baseStyles = "font-sf-pro font-medium";

  // Size styles
  const sizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Variant text colors
  const variantTextStyles = {
    primary: disabled ? "text-neutral-500" : "text-white",
    secondary: disabled ? "text-neutral-500" : "text-text-primary",
    outline: disabled ? "text-neutral-500" : "text-text-primary",
    ghost: disabled ? "text-neutral-500" : "text-primary-500",
  };

  return `${baseStyles} ${sizeStyles[size]} ${variantTextStyles[variant]}`;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onPress,
  fullWidth = false,
  className = "",
}: ButtonProps) {
  const buttonStyles = getButtonStyles(variant, size, disabled);
  const textStyles = getTextStyles(variant, size, disabled);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`${buttonStyles} ${fullWidth ? "w-full" : ""} ${className}`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
    >
      {loading && (
        <View className="mr-2">
          <ActivityIndicator
            size="small"
            color={
              variant === "primary" ? Colors.text.inverse : Colors.primary[500]
            }
          />
        </View>
      )}

      <Text className={textStyles}>{children}</Text>
    </TouchableOpacity>
  );
}
