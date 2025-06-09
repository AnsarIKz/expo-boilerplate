/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary colors
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

        // Neutral colors
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

        // Semantic colors
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

        // App specific colors
        background: {
          primary: "#fff4d6",
          secondary: "#fff9e9",
          surface: "#ffffff",
          cream: "#fffaea",
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

        // Legacy colors for backward compatibility
        cardBackground: "#fff9e9",
        secondaryText: "#a5a5a5",
        star: "#efd661",
      },
      fontFamily: {
        "sf-pro": ["SF Pro Text", "system-ui", "sans-serif"],
        "sf-pro-display": ["SF Pro Display", "system-ui", "sans-serif"],
        "sf-mono": ["SF Mono", "Menlo", "Monaco", "monospace"],
      },
      spacing: {
        13: "52px",
        15: "60px",
        17: "68px",
        18: "72px",
        22: "88px",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};
