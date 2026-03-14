/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream:  { DEFAULT: '#F5F0E8', dark: '#EDE8DF', card: '#FDFAF5' },
        accent: { DEFAULT: '#D4763B', hover: '#C2662B', soft: '#FAE8D8' },
        stone:  { muted: '#A8A29E' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
