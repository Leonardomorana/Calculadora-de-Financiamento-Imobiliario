/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1e40af',
        'brand-secondary': '#1d4ed8',
        'brand-accent': '#2563eb',
        'brand-light': '#dbeafe',
        'brand-dark': '#1e3a8a',
      },
    },
  },
  plugins: [],
}