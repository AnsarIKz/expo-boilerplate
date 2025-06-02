import { Ionicons } from "@expo/vector-icons";
import { forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { Colors } from "../tokens";

export interface InputProps extends Omit<TextInputProps, "className"> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "filled";
  className?: string;
  disabled?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      size = "md",
      variant = "outline",
      className = "",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return "px-3 py-2 text-sm";
        case "lg":
          return "px-4 py-4 text-lg";
        default:
          return "px-4 py-3 text-base";
      }
    };

    const getVariantStyles = () => {
      const baseStyles = "rounded-lg font-sf-pro";

      if (error) {
        return `${baseStyles} border-2 border-error-main bg-white`;
      }

      if (disabled) {
        return `${baseStyles} border border-neutral-300 bg-neutral-100`;
      }

      switch (variant) {
        case "filled":
          return `${baseStyles} bg-neutral-100 border-0`;
        default:
          return `${baseStyles} border border-neutral-300 bg-white`;
      }
    };

    const iconColor = disabled
      ? Colors.neutral[400]
      : error
      ? Colors.error.main
      : Colors.neutral[500];

    return (
      <View className={className}>
        {label && (
          <Text className="text-sm font-sf-pro font-medium text-neutral-700 mb-2">
            {label}
          </Text>
        )}

        <View className="relative">
          <TextInput
            ref={ref}
            className={`${getVariantStyles()} ${getSizeStyles()} ${
              leftIcon ? "pl-10" : ""
            } ${rightIcon ? "pr-10" : ""}`}
            placeholderTextColor={Colors.neutral[400]}
            editable={!disabled}
            {...props}
          />

          {leftIcon && (
            <View className="absolute left-3 top-1/2 -translate-y-1/2">
              <Ionicons name={leftIcon} size={20} color={iconColor} />
            </View>
          )}

          {rightIcon && (
            <View className="absolute right-3 top-1/2 -translate-y-1/2">
              <Ionicons
                name={rightIcon}
                size={20}
                color={iconColor}
                onPress={onRightIconPress}
              />
            </View>
          )}
        </View>

        {(error || hint) && (
          <Text
            className={`text-xs font-sf-pro mt-1 ${
              error ? "text-error-main" : "text-neutral-500"
            }`}
          >
            {error || hint}
          </Text>
        )}
      </View>
    );
  }
);
