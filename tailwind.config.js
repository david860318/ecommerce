/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF8F5',
          100: '#F5F0EB',
          200: '#E8DED4',
          300: '#D5C3B2',
          400: '#B8A08C',
          500: '#9B7E68',  // 溫柔燕麥摩卡色
          600: '#7F6450',
          700: '#644D3D',
          800: '#4E3C30',
          900: '#3A2E26',
        }
      }
    },
  },
  plugins: [],
}