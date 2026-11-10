/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F8FAFC",
        surface: "#FFFFFF",
        sidebar: "#FFFFFF",
        border: "#E5E7EB",
        borderSubtle: "#F3F4F6",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        textMuted: "#9CA3AF",
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        severity: {
          critical: "#DC2626",
          criticalBg: "#FEF2F2",
          criticalBorder: "#FEE2E2",
          high: "#EA580C",
          highBg: "#FFF7ED",
          highBorder: "#FFEDD5",
          medium: "#D97706",
          mediumBg: "#FFFBEB",
          mediumBorder: "#FEF3C7",
          low: "#059669",
          lowBg: "#ECFDF5",
          lowBorder: "#D1FAE5",
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
