/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#10B981",
        dark: "#1E293B",
        glass: "rgba(255, 255, 255, 0.3)",
      },
      backgroundColor: {
        glass: "rgba(255, 255, 255, 0.1)",
      },
      borderColor: {
        glass: "rgba(255, 255, 255, 0.2)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.1)",
        neon: "0 0 20px rgba(59, 130, 246, 0.5)",
      },
      backdropBlur: {
        glass: "10px",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      spacing: {
        glass: "1px",
      },
      fontFamily: {
        sans: ["Vazirmatn", "sans-serif"],
      },
    },
  },
  plugins: [],
}
