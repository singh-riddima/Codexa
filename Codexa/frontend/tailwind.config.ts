import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'hsl(var(--surface))',
        panel: 'hsl(var(--panel))',
        border: 'hsl(var(--border))',
        brand: {
          50: '#f6efff',
          100: '#ead7ff',
          200: '#d4afff',
          300: '#b26cff',
          400: '#9854ff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#3f1d86',
          900: '#23113d'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(168,85,247,.18), 0 18px 60px rgba(168,85,247,.2)'
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top left, rgba(168,85,247,.35), transparent 38%), radial-gradient(circle at top right, rgba(236,72,153,.28), transparent 30%), linear-gradient(180deg, rgba(8,8,16,1), rgba(10,10,18,1) 46%, rgba(7,7,12,1))',
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.02))'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite'
      }
    }
  },
  plugins: []
} satisfies Config;