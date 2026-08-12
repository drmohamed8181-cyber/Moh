import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0066CC",
          50:  "#E6F0FF",
          100: "#CCE0FF",
          200: "#99C2FF",
          300: "#66A3FF",
          400: "#3385FF",
          500: "#0066CC",
          600: "#0052A3",
          700: "#003D7A",
          800: "#002952",
          900: "#001429",
        },
        medical: {
          blue: "#0066CC",
          lightBlue: "#E8F4FD",
          green: "#00A651",
          red: "#CC0000",
          gray: "#F8F9FA",
        },
        gold: {
          DEFAULT: "#C6A664",
          50: "#F8F3E8",
          100: "#F0E6D2",
          200: "#E2CDA5",
          300: "#D4B478",
          400: "#C6A664",
          500: "#B8974F",
          600: "#96793D",
          700: "#755D2F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 2px 16px rgba(0,102,204,0.08)",
        "card-hover": "0 8px 32px rgba(0,102,204,0.16)",
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
