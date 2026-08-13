import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0d16",
        panel: "#131826",
        panel2: "#1a2033",
        border: "#232a3d",
        text: "#e9ecf5",
        "text-dim": "#8790a8",
        "text-faint": "#545e78",
        green: "#34d399",
        "green-dim": "#16342a",
        blue: "#60a5fa",
        "blue-dim": "#16283f",
        orange: "#fb923c",
        "orange-dim": "#3a2716",
        purple: "#a78bfa",
        "purple-dim": "#2a2242",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
