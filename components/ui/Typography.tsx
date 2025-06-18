import { ReactNode } from "react";
import { Text } from "react-native";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "caption"
  | "overline";

export type TypographyColor =
  | "primary"
  | "secondary"
  | "disabled"
  | "inverse"
  | "success"
  | "warning"
  | "error"
  | "info";

export type TypographyAlign = "left" | "center" | "right" | "justify";

interface TypographyProps {
  children: ReactNode;
  variant?: TypographyVariant;
  color?: TypographyColor;
  align?: TypographyAlign;
  className?: string;
  numberOfLines?: number;
}

const getVariantStyles = (variant: TypographyVariant) => {
  const styles = {
    h1: "text-5xl leading-tight",
    h2: "text-4xl leading-tight",
    h3: "text-3xl leading-tight",
    h4: "text-2xl leading-normal",
    h5: "text-xl leading-normal",
    h6: "text-lg leading-normal",
    subtitle1: "text-base leading-normal",
    subtitle2: "text-sm leading-normal",
    body1: "text-base leading-relaxed",
    body2: "text-sm leading-normal",
    caption: "text-xs leading-normal",
    overline: "text-xs uppercase tracking-wide leading-normal",
  };

  return styles[variant];
};

const getVariantFontWeight = (variant: TypographyVariant) => {
  const weights = {
    h1: "700" as const, // bold
    h2: "700" as const, // bold
    h3: "700" as const, // bold
    h4: "600" as const, // semibold
    h5: "600" as const, // semibold
    h6: "600" as const, // semibold
    subtitle1: "500" as const, // medium
    subtitle2: "500" as const, // medium
    body1: "400" as const, // normal
    body2: "400" as const, // normal
    caption: "400" as const, // normal
    overline: "500" as const, // medium
  };

  return weights[variant];
};

const getColorStyles = (color: TypographyColor) => {
  const styles = {
    primary: "text-neutral-900",
    secondary: "text-neutral-600",
    disabled: "text-neutral-400",
    inverse: "text-white",
    success: "text-success-main",
    warning: "text-warning-main",
    error: "text-error-main",
    info: "text-info-main",
  };

  return styles[color];
};

const getAlignStyles = (align: TypographyAlign) => {
  const styles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  };

  return styles[align];
};

export function Typography({
  children,
  variant = "body1",
  color = "primary",
  align,
  className = "",
  numberOfLines,
}: TypographyProps) {
  const variantStyles = getVariantStyles(variant);
  const colorStyles = getColorStyles(color);
  const alignStyles = align ? getAlignStyles(align) : "";
  const fontWeight = getVariantFontWeight(variant);

  return (
    <Text
      style={{ fontWeight }}
      numberOfLines={numberOfLines}
      className={`${variantStyles} ${colorStyles} ${alignStyles} ${className}`}
    >
      {children}
    </Text>
  );
}

// Удобные компоненты для часто используемых вариантов
export const Heading1 = (props: Omit<TypographyProps, "variant">) => (
  <Typography {...props} variant="h1" />
);

export const Heading2 = (props: Omit<TypographyProps, "variant">) => (
  <Typography {...props} variant="h2" />
);

export const Heading3 = (props: Omit<TypographyProps, "variant">) => (
  <Typography {...props} variant="h3" />
);

export const Body = (props: Omit<TypographyProps, "variant">) => (
  <Typography {...props} variant="body1" />
);

export const Caption = (props: Omit<TypographyProps, "variant">) => (
  <Typography {...props} variant="caption" />
);
