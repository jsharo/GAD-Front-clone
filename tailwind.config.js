/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Colores principales de la interfaz
        primary: {
          default: '#3B82F6', // azul principal
          light: '#60A5FA',
          dark: '#1E40AF',
        },
        secondary: {
          default: '#F59E0B', // naranja secundario
          light: '#FBBF24',
          dark: '#B45309',
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
}