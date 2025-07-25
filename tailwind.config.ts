import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Anuphan: ["Anuphan", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "primary-color": "#6149CD",
        "primary-color-hover": "#4f3bbd",
        "primary-color-focus": "#7563D1",
        "icon-color": "#383767",
        "secondary-color": "#569DF8",
        "background-color": "#F7F8FA",
        "info-color": "#2E90FA",
        "success-color": "#27AE60",
        "warning-color": "#FFCD1B",
        "error-color": "#F04438",
      },
      transitionProperty: {
        width: "width",
        height: "height",
      },
    },
  },
  plugins: [],
};
export default config;
