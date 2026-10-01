import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0820",
        night: "#17123a",
        dusk: "#2b1f5c",
        win: "#2a3aa8",
        "win-dark": "#171f6b",
        paper: "#f4f1ff",
        dim: "#b9b4e6",
        faint: "#7d77b8",
        gold: "#ffd24a",
        "gold-dark": "#c48a1a",
        ruby: "#ff4d6d",
        leaf: "#5bd96a",
        sky: "#4ad8ff",
        grape: "#b377ff",
        ember: "#ff9a3c",
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
        body: ["var(--font-body)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
