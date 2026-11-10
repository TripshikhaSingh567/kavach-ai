/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        soc: {
          bg: "#070b14",
          card: "#0d1424",
          cardHover: "#131d33",
          border: "#1e293b",
          borderLight: "#334155",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          purple: "#a855f7",
          amber: "#f59e0b",
          rose: "#f43f5e",
          emerald: "#10b981",
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
};
