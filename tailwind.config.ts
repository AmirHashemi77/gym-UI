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
          red: '#B31217',
          'red-strong': '#8E0E12',
          'red-bright': '#D61F26',
          'red-text': '#FF6B70',
          black: '#0B0B0D',
          charcoal: '#15171A',
          carbon: '#1D2126',
          stone: '#2A2F36',
          surface: '#121417',
          'surface-2': '#1A1D22',
          border: '#2B3138',
          'text-main': '#F3F4F6',
          'text-soft': '#B7BDC6',
          'text-muted': '#8A919B',
          metallic: '#6A1B1F',
        },
        status: {
          success: '#3F8F62',
          error: '#D61F26',
          warning: '#B66A28',
          info: '#567A99',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(11, 11, 13, 0.24)',
        card: '0 10px 32px rgba(0, 0, 0, 0.3)',
        glow: '0 0 28px rgba(179, 18, 23, 0.34)',
        'glow-sm': '0 0 16px rgba(214, 31, 38, 0.24)',
      },
    },
  },
  plugins: [],
} satisfies Config;
