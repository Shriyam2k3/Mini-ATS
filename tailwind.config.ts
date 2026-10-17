import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          950: "#022C22",
          DEFAULT: "#064E3B", // Dark green primary
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
        },
        ats: {
          dark: "#0F172A",
          green: "#064E3B",
          accent: "#10B981",
          lightGreen: "#ECFDF5",
          grayText: "#64748B",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
