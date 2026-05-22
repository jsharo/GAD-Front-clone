/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        // ============================================================
        // PALETA OFICIAL GAD MUNICIPAL DE CAÑAR
        // Extraída del Escudo Provincial
        // ============================================================

        // AZUL — Color principal institucional (Fondo del escudo)
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563EB',   // ← Azul oficial
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#1E3A8A',
          950: '#172554',
        },

        // ORO / AMARILLO — Estrellas y detalles
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F5C100',   // ← Oro oficial
          600: '#D4A800',
          700: '#B08A00',
          800: '#8C6E00',
          900: '#6B5200',
          950: '#3D2E00',
        },

        // VERDE — Árbol del escudo
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22C55E',   // ← Verde oficial
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },

        // ROJO / FUEGO — Llama superior
        danger: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#EA580C',   // ← Naranja/Fuego
          600: '#C2410C',
          700: '#9A3412',
          800: '#7C2D12',
          900: '#431407',
        },

        // SUPERFICIE — Fondo claro premium
        surface: {
          DEFAULT: '#F8FAFC',
          card:    '#FFFFFF',
          border:  '#E2E8F0',
          muted:   '#F1F5F9',
          warm:    '#F8FAFC',
        },
      },

      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero':     'linear-gradient(160deg, #F8FAFC 0%, #F1F5F9 40%, #E2E8F0 100%)',
        'gradient-card':     'linear-gradient(145deg, rgba(37,99,235,0.02) 0%, rgba(255,255,255,0.95) 100%)',
        'gradient-primary':  'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'gradient-accent':   'linear-gradient(135deg, #F5C100 0%, #D4A800 100%)',
        'gradient-success':  'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
        'gradient-danger':   'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
        'gradient-shield':   'linear-gradient(135deg, #2563EB 0%, #F5C100 50%, #22C55E 100%)',
      },

      boxShadow: {
        'glow-primary': '0 0 30px rgba(37, 99, 235, 0.25)',
        'glow-accent':  '0 0 30px rgba(245, 193, 0, 0.25)',
        'glow-success': '0 0 30px rgba(34, 197, 94, 0.25)',
        'glow-danger':  '0 0 30px rgba(234, 88, 12, 0.25)',
        'card':         '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-hover':   '0 8px 40px rgba(37, 99, 235, 0.1)',
        'gold-border':  'inset 0 0 0 1px rgba(37, 99, 235, 0.2)',
      },

      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'spin-slow':  'spin 8s linear infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 10px rgba(37, 99, 235, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(37, 99, 235, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
