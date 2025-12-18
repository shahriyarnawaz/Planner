/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors mapped to new olive/cream/text palette
        primary: {
          DEFAULT: "#6B7A4E", // Olive primary
          light: "#8A9A5B",   // Olive secondary
          dark: "#5A6741",    // Olive dark (hover/cta)
        },

        background: {
          DEFAULT: "#F7F4EE", // Cream primary
          soft: "#EFEAD7",    // Cream secondary
          dark: "#E0DAC8",    // Slightly darker for cards
        },

        heading: "#2F3327",   // Text primary
        body: "#5C614F",      // Text secondary
        muted: "#8E937C",     // Text muted

        // Direct access to palette groups if needed
        olive: {
          DEFAULT: "#6B7A4E",
          light: "#8A9A5B",
          dark: "#5A6741",
        },

        cream: {
          DEFAULT: "#F7F4EE",
          light: "#EFEAD7",
          dark: "#E0DAC8",
        },

        accent: {
          gold: "#D4AF37", // Yellow-golden accent for highlights
        },

        text: {
          primary: "#2F3327",
          secondary: "#5C614F",
          muted: "#8E937C",
        },

        // Status colors (kept from previous theme for success/warning/danger)
        success: {
          DEFAULT: "#16A34A",
          light: "#22C55E",
          dark: "#15803D",
        },

        warning: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
          dark: "#D97706",
        },

        danger: {
          DEFAULT: "#DC2626",
          light: "#EF4444",
          dark: "#B91C1C",
        },
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        serif: ["Merriweather", "ui-serif", "Georgia"],
      },
    },
  },
  plugins: [],
};
