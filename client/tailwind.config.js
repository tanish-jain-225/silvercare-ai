/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Dark mode colors - complementary opposites
        dark: {
          50: '#1a1a1a',
          100: '#262626',
          200: '#404040',
          300: '#525252',
          400: '#737373',
          500: '#a3a3a3',
          600: '#d4d4d4',
          700: '#e5e5e5',
          800: '#f5f5f5',
          900: '#fafafa',
        },
        // Background colors
        background: {
          light: '#ffffff',
          dark: '#0f0f0f',
        },
        // Surface colors
        surface: {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
        // Text colors
        text: {
          light: {
            primary: '#1f2937',
            secondary: '#6b7280',
            tertiary: '#9ca3af',
          },
          dark: {
            primary: '#f9fafb',
            secondary: '#d1d5db',
            tertiary: '#9ca3af',
          },
        },
      },
      animation: {
        'theme-toggle': 'theme-toggle 0.3s ease-in-out',
        'slide-in': 'slide-in 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'theme-toggle': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionProperty: {
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
    },
  },
  plugins: [],
};
