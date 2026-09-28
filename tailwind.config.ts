import type { Config } from "tailwindcss";

// Colors are CSS variables (defined in app/globals.css) so the whole palette
// can be retuned in one place; `<alpha-value>` keeps /opacity modifiers working.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        panel: token("panel"),
        panel2: token("panel2"),
        border: token("border"),
        text: token("text"),
        "text-dim": token("text-dim"),
        "text-faint": token("text-faint"),
        gold: token("gold"),
        "gold-bright": token("gold-bright"),
        "gold-dim": token("gold-dim"),
        green: token("green"),
        "green-dim": token("green-dim"),
        blue: token("blue"),
        "blue-dim": token("blue-dim"),
        orange: token("orange"),
        "orange-dim": token("orange-dim"),
        purple: token("purple"),
        "purple-dim": token("purple-dim"),
        red: token("red"),
        "red-dim": token("red-dim"),
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-cinzel)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 12px 32px -12px rgb(0 0 0 / 0.6)",
        glow: "0 0 24px -4px rgb(var(--gold) / 0.45)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
