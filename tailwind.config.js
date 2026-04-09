/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1A1A2E",
        orange: "#F4A261",
        teal: "#2A9D8F",
        gold: "#E9C46A",
        background: "#1A1A2E", // Defaulting to navy
        primary: "#F4A261",
        secondary: "#2A9D8F",
        accent: "#E9C46A",
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        fredoka: ['"Fredoka One"', 'cursive'],
      },
      borderRadius: {
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
