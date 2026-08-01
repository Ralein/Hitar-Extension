/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36aff8',
          500: '#0c93e7',
          600: '#0276c5',
          700: '#035ea1',
          800: '#075085',
          900: '#0c436e',
          950: '#082b49',
        },
      },
    },
  },
  plugins: [],
};
