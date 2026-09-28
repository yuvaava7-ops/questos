import type { Accent } from "@/lib/types";

// Full class strings (not template-built) so Tailwind's scanner keeps them.
export const ACCENT_CLASSES: Record<Accent, { bar: string; text: string; border: string; dim: string; stroke: string }> = {
  green: { bar: "bg-green", text: "text-green", border: "border-green/30", dim: "bg-green-dim", stroke: "stroke-green" },
  blue: { bar: "bg-blue", text: "text-blue", border: "border-blue/30", dim: "bg-blue-dim", stroke: "stroke-blue" },
  orange: { bar: "bg-orange", text: "text-orange", border: "border-orange/30", dim: "bg-orange-dim", stroke: "stroke-orange" },
  purple: { bar: "bg-purple", text: "text-purple", border: "border-purple/30", dim: "bg-purple-dim", stroke: "stroke-purple" },
};

export const INPUT_CLASS =
  "rounded-[8px] border border-transparent bg-panel2 px-3 py-2 text-[13px] text-text placeholder:text-text-faint focus:border-gold/40 focus:outline-none";

export const PRIMARY_BUTTON_CLASS =
  "rounded-[8px] bg-gold font-semibold text-bg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60";
