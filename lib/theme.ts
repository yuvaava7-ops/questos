import type { Accent } from "@/lib/types";

// Full class strings (not template-built) so Tailwind's scanner keeps them.
export const ACCENT_CLASSES: Record<Accent, { bar: string; text: string; border: string; dim: string; stroke: string; glow: string }> = {
  green: {
    bar: "bg-gradient-to-r from-green/80 to-green",
    text: "text-green",
    border: "border-green/35",
    dim: "bg-green-dim",
    stroke: "stroke-green",
    glow: "shadow-[0_0_24px_-8px_rgb(var(--green)/0.55)]",
  },
  blue: {
    bar: "bg-gradient-to-r from-blue/80 to-blue",
    text: "text-blue",
    border: "border-blue/35",
    dim: "bg-blue-dim",
    stroke: "stroke-blue",
    glow: "shadow-[0_0_24px_-8px_rgb(var(--blue)/0.55)]",
  },
  orange: {
    bar: "bg-gradient-to-r from-orange/80 to-orange",
    text: "text-orange",
    border: "border-orange/35",
    dim: "bg-orange-dim",
    stroke: "stroke-orange",
    glow: "shadow-[0_0_24px_-8px_rgb(var(--orange)/0.55)]",
  },
  purple: {
    bar: "bg-gradient-to-r from-purple/80 to-purple",
    text: "text-purple",
    border: "border-purple/35",
    dim: "bg-purple-dim",
    stroke: "stroke-purple",
    glow: "shadow-[0_0_24px_-8px_rgb(var(--purple)/0.55)]",
  },
};

export type BarTone = Accent | "gold";

export const BAR_TONES: Record<BarTone, string> = {
  gold: "bg-gradient-to-r from-gold to-gold-bright shadow-[0_0_10px_-1px_rgb(var(--gold)/0.7)]",
  green: "bg-gradient-to-r from-green/80 to-green shadow-[0_0_10px_-1px_rgb(var(--green)/0.6)]",
  blue: "bg-gradient-to-r from-blue/80 to-blue shadow-[0_0_10px_-1px_rgb(var(--blue)/0.6)]",
  orange: "bg-gradient-to-r from-orange/80 to-orange shadow-[0_0_10px_-1px_rgb(var(--orange)/0.6)]",
  purple: "bg-gradient-to-r from-purple/80 to-purple shadow-[0_0_10px_-1px_rgb(var(--purple)/0.6)]",
};

export const INPUT_CLASS =
  "rounded-[10px] border border-border/70 bg-bg/60 px-3 py-2 text-[13px] text-text placeholder:text-text-faint transition-colors focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/15";

export const PRIMARY_BUTTON_CLASS =
  "rounded-[10px] bg-gradient-to-b from-gold-bright to-gold font-semibold text-bg shadow-[0_1px_0_0_rgb(255_255_255/0.35)_inset,0_6px_20px_-8px_rgb(var(--gold)/0.8)] transition-all hover:brightness-110 hover:shadow-[0_1px_0_0_rgb(255_255_255/0.35)_inset,0_8px_28px_-6px_rgb(var(--gold)/0.9)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60 disabled:hover:brightness-100";

export const SECONDARY_BUTTON_CLASS =
  "rounded-[10px] border border-border/80 bg-panel2/80 font-semibold text-text-dim transition-colors hover:border-gold/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50";
