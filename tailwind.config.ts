import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          yellow: '#FAED26',
        },
        surface: {
          dark: '#46344E',
          mid: '#5A5560',
          light: '#9D8D8F',
        },
        accent: {
          rose: '#9B786F',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(70, 52, 78, 0.12)',
        card: '0 4px 24px rgba(0, 0, 0, 0.18)',
        glow: '0 0 28px rgba(250, 237, 38, 0.28)',
        'glow-sm': '0 0 14px rgba(250, 237, 38, 0.18)',
      },
    },
  },
  plugins: [],
} satisfies Config;
