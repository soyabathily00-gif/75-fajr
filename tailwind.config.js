/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'app-bg':    'rgb(var(--app-bg) / <alpha-value>)',
        'surface':   'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        'ink':       'rgb(var(--ink) / <alpha-value>)',
        'ink-2':     'rgb(var(--ink-2) / <alpha-value>)',
        'ink-3':     'rgb(var(--ink-3) / <alpha-value>)',
        'rim':       'rgb(var(--rim) / <alpha-value>)',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%':       { transform: 'translateX(-10px)' },
          '35%':       { transform: 'translateX(10px)' },
          '55%':       { transform: 'translateX(-6px)' },
          '75%':       { transform: 'translateX(6px)' },
          '90%':       { transform: 'translateX(-3px)' },
        },
        'check-pop': {
          '0%':   { transform: 'scale(0.6)', opacity: '0' },
          '60%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-once': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
      animation: {
        shake:        'shake 0.5s ease-in-out',
        'check-pop':  'check-pop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-up':   'slide-up 0.25s ease-out',
        'fade-in':    'fade-in 0.2s ease-out',
        'pulse-once': 'pulse-once 0.6s ease-in-out',
      },
    },
  },
  plugins: [],
}
