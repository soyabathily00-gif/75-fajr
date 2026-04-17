/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%':       { transform: 'translateX(-10px)' },
          '35%':       { transform: 'translateX(10px)' },
          '55%':       { transform: 'translateX(-6px)' },
          '75%':       { transform: 'translateX(6px)' },
          '90%':       { transform: 'translateX(-3px)' },
        },
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
}
