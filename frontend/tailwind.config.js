/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00C73C',
          50: '#E6FFF0',
          100: '#B3FFD6',
          200: '#80FFBC',
          300: '#4DFFA3',
          400: '#1AFF89',
          500: '#00C73C',
          600: '#009E30',
          700: '#007524',
          800: '#004C18',
          900: '#00230C',
        },
      },
    },
  },
  plugins: [],
};
