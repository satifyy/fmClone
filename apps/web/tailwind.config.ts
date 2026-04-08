import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0d1b1e",
        field: "#5f7f5b",
        sand: "#d6c6a2",
        ember: "#c7613a",
        mist: "#dbe5e0"
      },
      fontFamily: {
        display: ["Baskerville", "Georgia", "serif"],
        sans: ["Avenir Next", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

