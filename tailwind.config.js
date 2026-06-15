/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta institucional USAC / Facultad de Ingeniería
        usac: {
          50: "#eaf1fb",
          100: "#cfe0f7",
          200: "#a3c2ef",
          300: "#74a1e3",
          400: "#4a83d6",
          500: "#2c66c2",
          600: "#1d4ea3",
          700: "#163e82",
          800: "#102e60", // Azul institucional principal
          900: "#0a1f42",
          950: "#06142c",
        },
      },
    },
  },
  plugins: [],
};
