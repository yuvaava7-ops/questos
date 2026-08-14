import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0c0a08",
        panel: "#17130f",
        panel2: "#201a14",
        border: "#3a2f22",
        text: "#ece4d6",
        "text-dim": "#a89984",
        "text-faint": "#6e6151",
        gold: "#c8a15c",
        "gold-dim": "#2b2213",
        green: "#7c9a6b",
        "green-dim": "#1f2a1a",
        blue: "#6a94a8",
        "blue-dim": "#16232a",
        orange: "#c8703f",
        "orange-dim": "#2c1c12",
        purple: "#8b6fa8",
        "purple-dim": "#241c2e",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Cinzel", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
