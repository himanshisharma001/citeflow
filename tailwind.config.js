/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#090d16",
        surface: "#0f172a",
        primary: "#0284c7",
      },
    },
  },
  plugins: [],
};