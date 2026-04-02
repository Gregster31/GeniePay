/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        purple: { DEFAULT: '#5D00F2' },
        cyan:   { DEFAULT: '#23DDC6' },
      },
    },  },
  plugins: [],
}