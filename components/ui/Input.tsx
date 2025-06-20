import { Ionicons } from "@expo/vector-icons";
import { forwardRef } from "react";
import { Pressable, TextInput, TextInputProps, View } from "react-native";
import { Colors } from "../tokens";

export interface InputProps extends Omit<TextInputProps, "className"> {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: "outline" | "filled" | "ghost";
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      leftIcon,
      rightIcon,
      onRightIconPress,
      variant = "outline",
      disabled = false,
      error = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const getStyles = () => {
      const base = props.multiline
        ? "min-h-[92px] px-3 rounded-xl"
        : "h-[46px] px-3 rounded-xl";

      if (error) {
        return `${base} border-2 border-error-main bg-white`;
      }

      if (disabled) {
        return `${base} border border-neutral-300 bg-neutral-100`;
      }

      switch (variant) {
        case "filled":
          return `${base} bg-neutral-100 border-0`;
        case "ghost":
          return `${base} bg-transparent border-0`;
        default:
          return `${base} border border-neutral-300 bg-white`;
      }
    };

    const iconColor = disabled
      ? Colors.neutral[400]
      : error
      ? Colors.error.main
      : Colors.neutral[500];

    return (
      <View
        className={`flex-row ${
          props.multiline ? "items-start" : "items-center"
        } w-full ${getStyles()} ${className}`}
      >
        {leftIcon && (
          <View className={`mr-3 ${props.multiline ? "pt-3" : ""}`}>
            <Ionicons name={leftIcon} size={20} color={iconColor} />
          </View>
        )}

        <TextInput
          ref={ref}
          className={`flex-1 text-base ${
            props.multiline ? "py-3" : "h-full py-0 my-0"
          }`}
          style={{
            fontFamily: "SF-Pro-Text",
            color: disabled ? Colors.neutral[400] : Colors.text.primary,
            textAlignVertical: props.multiline ? "top" : "center",
          }}
          placeholderTextColor={Colors.neutral[400]}
          editable={!disabled}
          {...props}
        />

        {rightIcon && (
          <Pressable
            className={`ml-3 ${props.multiline ? "pt-3" : ""}`}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Ionicons name={rightIcon} size={20} color={iconColor} />
          </Pressable>
        )}
      </View>
    );
  }
);
