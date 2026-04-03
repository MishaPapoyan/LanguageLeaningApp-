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
        "fade-up":        "fadeSlide 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":        "fadeIn 0.25s ease-out both",
        "bounce-subtle":  "bounceSubtle 2s ease-in-out infinite",
        "bounce-in":      "bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "streak-flame":   "streakFlame 1.5s ease-in-out infinite",
        "slide-up":       "slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in":       "slideIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in":       "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "shimmer":        "shimmer 2s linear infinite",
        "typing-dot":     "typingDot 1.2s ease infinite",
        "pulse-glow":     "pulseGlow 2s ease-in-out infinite",
        "spin-slow":      "spin 3s linear infinite",
        "float":          "float 3s ease-in-out infinite",
        "aurora":         "aurora 8s ease-in-out infinite",
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
        bounceIn: {
          "0%":   { opacity: "0", transform: "scale(0.8)" },
          "70%":  { transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        streakFlame: {
          "0%, 100%": { transform: "scale(1) rotate(-2deg)" },
          "50%":      { transform: "scale(1.15) rotate(2deg)" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
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
          "0%, 60%, 100%": { opacity: "0.4", transform: "translateY(0)" },
          "30%":           { opacity: "1",   transform: "translateY(-4px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(99,102,241,0.3)" },
          "50%":      { boxShadow: "0 0 28px rgba(99,102,241,0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        aurora: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1) rotate(0deg)" },
          "50%":      { opacity: "0.8", transform: "scale(1.1) rotate(5deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
