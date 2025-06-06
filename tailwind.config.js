/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./public/index.html",
    "./views/**/*.ejs",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#3762EC",
          50: "#eaf0fe",
          100: "#dbe6fd",
          200: "#b7cdfb",
          300: "#8baaf7",
          400: "#5c85f2",
          500: "#3762EC",
          600: "#2b4ec2",
          700: "#223d99",
          800: "#192b70",
          900: "#101947",
        },
      },
    },
  },
  plugins: [],
};
