/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2B4EE6',
        secondary: '#2B4EE6',
        dark: {
          50: '#18191A',
          100: '#242526',
          200: '#3A3B3C',
          300: '#4E4F50',
          400: '#6B7280',
          500: '#9CA3AF',
          600: '#D1D5DB',
          900: '#F3F4F6'
        },
        text: {
          light: '#42484C',
          dark: '#E4E6EA'
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9BA9B4',
          500: '#6B7280',
          600: '#4B5563',
          900: '#111827'
        },
        blue: {
          100: '#E5EDFF',
          600: '#2B4EE6'
        },
        orange: {
          100: '#FFEDD5',
          600: '#EA580C'
        },
        white: '#FFFFFF',
        black: '#000000'
      },
    },
  },
  plugins: [],
};