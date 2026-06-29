/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Colores principales de la interfaz
        primary: {
          default: '#004183', // azul principal
          light: '#0252a2',
          dark: '#01386e',
        },
        secondary: {
          default: '#49c4e6', // naranja secundario
          light: '#52d6fa',
          dark: '#3ea4c1',
        },

        // Escala de blanco a negro
        neutral: {
          50: '#ffffff',
          100: '#f9fafb',
          200: '#f3f4f6',
          300: '#e5e7eb',
          400: '#d1d5db',
          500: '#9ca3af',
          600: '#6b7280',
          700: '#4b5563',
          800: '#1f2937',
          900: '#111827',
          950: '#000000',
        },

        // Colores de estado
        success: {
          light: '#86efac',
          default: '#22C55E',
          dark: '#15803D',
        },
        error: {
          light: '#fca5a5',
          default: '#EF4444',
          dark: '#B91C1C',
        },
        warning: {
          light: '#fde68a',
          default: '#f59e0b',
          dark: '#b45309',
        },
      },
    },
  },
  plugins: [],
};
