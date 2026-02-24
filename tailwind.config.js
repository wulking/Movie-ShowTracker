/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          light: "rgb(var(--accent-light) / <alpha-value>)",
        },
        fr: {
          midnight: "rgb(var(--fr-midnight) / <alpha-value>)",
          deep: "rgb(var(--fr-deep) / <alpha-value>)",
          dark: "rgb(var(--fr-dark) / <alpha-value>)",
          surface: "rgb(var(--fr-surface) / <alpha-value>)",
          card: "rgb(var(--fr-card) / <alpha-value>)",
          elevated: "rgb(var(--fr-elevated) / <alpha-value>)",
          border: "rgb(var(--fr-border) / <alpha-value>)",
          "border-light": "rgb(var(--fr-border-light) / <alpha-value>)",
          muted: "rgb(var(--fr-muted) / <alpha-value>)",
          subtle: "rgb(var(--fr-subtle) / <alpha-value>)",
          text: "rgb(var(--fr-text) / <alpha-value>)",
          "text-light": "rgb(var(--fr-text-light) / <alpha-value>)",
          light: "rgb(var(--fr-light) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
