/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#a14573",
        "teal-accent": "#287b78",
        "background-light": "#f7f6f2",
        "background-dark": "#1a1d23",
        "card-light": "#ffffff",
        "card-dark": "#2a2e35",
        "text-main": "#181114",
        "text-muted": "#856073",
      },
      fontFamily: {
        "display": ["Noto Serif", "serif"],
        "sans": ["Manrope", "sans-serif"],
        "jakarta": ["Plus Jakarta Sans", "sans-serif"],
        "serif": ["Lora", "serif"],
        "news": ["Newsreader", "serif"],
      },
      boxShadow: {
        'whisper': '0 4px 20px -2px rgba(161, 69, 115, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.02)',
        'soft': '0 10px 40px -10px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}