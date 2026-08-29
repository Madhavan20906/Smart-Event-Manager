/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#111827',
        'surface-hover': '#1f293d',
        card: '#151d30',
        border: '#1e293b',
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.35)',
        },
        secondary: {
          DEFAULT: '#06b6d4',
          hover: '#0891b2',
        },
        accent: {
          DEFAULT: '#10b981',
          hover: '#059669',
        },
        warning: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
        },
        danger: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.5)',
        'glow-accent': '0 0 25px -5px rgba(16, 185, 129, 0.5)',
        'glow-warning': '0 0 25px -5px rgba(245, 158, 11, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'radar-spin': 'radarSpin 4s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(99, 102, 241, 0.7)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        radarSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
