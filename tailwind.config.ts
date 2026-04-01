import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        obsidian: {
          50:  "#f0f0ff",
          100: "#e4e4f7",
          200: "#c8c8ef",
          300: "#a0a0e0",
          400: "#7272c8",
          500: "#5252b0",
          600: "#3d3d92",
          700: "#2e2e72",
          800: "#1e1e54",
          900: "#0f0f36",
          950: "#060810",
        },
      },
      animation: {
        "fade-up":        "fadeSlide 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":        "fadeIn 0.3s ease-out forwards",
        "bounce-subtle":  "bounceSubtle 2s ease-in-out infinite",
        "streak-flame":   "streakFlame 1.5s ease-in-out infinite",
        "slide-up":       "slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in":       "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        "shimmer":        "shimmer 2.5s linear infinite",
        "typing-dot":     "typingDot 1.4s infinite",
        "pulse-glow":     "pulseGlow 2s ease-in-out infinite",
        "float":          "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeSlide: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
        streakFlame: {
          "0%, 100%": { transform: "scale(1) rotate(-2deg)" },
          "50%":      { transform: "scale(1.15) rotate(2deg)" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        typingDot: {
          "0%, 60%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "30%":           { opacity: "1",   transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124,58,237,0.3)" },
          "50%":      { boxShadow: "0 0 40px rgba(124,58,237,0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
