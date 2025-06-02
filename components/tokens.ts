/**
 * Design System Tokens
 * Централизованные токены для всей дизайн-системы
 */

export const Colors = {
  // Primary Colors
  primary: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#bd561c", // Main primary color
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },

  // Neutral Colors
  neutral: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },

  // Semantic Colors
  success: {
    light: "#22c55e",
    main: "#16a34a",
    dark: "#15803d",
  },

  warning: {
    light: "#f59e0b",
    main: "#d97706",
    dark: "#b45309",
  },

  error: {
    light: "#ef4444",
    main: "#dc2626",
    dark: "#b91c1c",
  },

  info: {
    light: "#3b82f6",
    main: "#2563eb",
    dark: "#1d4ed8",
  },

  // App Specific
  background: {
    primary: "#fff4d6",
    secondary: "#fff9e9",
    surface: "#ffffff",
  },

  text: {
    primary: "#0d0d0d",
    secondary: "#a5a5a5",
    disabled: "#d4d4d4",
    inverse: "#ffffff",
  },

  border: {
    light: "#e5e5e5",
    main: "#a5a5a5",
    dark: "#737373",
  },

  // Special
  star: "#efd661",
  shadow: "rgba(0, 0, 0, 0.1)",
} as const;

export const Typography = {
  fontFamily: {
    primary: "SF Pro Text",
    display: "SF Pro Display",
    mono: "SF Mono",
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 15,
    lg: 16,
    xl: 18,
    "2xl": 20,
    "3xl": 24,
    "4xl": 28,
    "5xl": 32,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 10,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
