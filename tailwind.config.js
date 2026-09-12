/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        linkedin: {
          blue: "#0a66c2",
          darkBlue: "#004182",
          bg: "#f3f2ef",
          card: "#ffffff",
          border: "#e0dfdc",
        },
      },
    },
  },
  plugins: [],
};
