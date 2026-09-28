import type { Accent } from "@/lib/types";

// Full class strings (not template-built) so Tailwind's scanner keeps them.
export const ACCENT_CLASSES: Record<Accent, { text: string; border: string; dim: string; stroke: string }> = {
  green: { text: "text-green", border: "border-green/40", dim: "bg-green-dim", stroke: "stroke-green" },
  blue: { text: "text-blue", border: "border-blue/40", dim: "bg-blue-dim", stroke: "stroke-blue" },
  orange: { text: "text-orange", border: "border-orange/40", dim: "bg-orange-dim", stroke: "stroke-orange" },
  purple: { text: "text-purple", border: "border-purple/40", dim: "bg-purple-dim", stroke: "stroke-purple" },
};

// Painted bar fills from /public/ui (the sheet has no orange, so orange uses red).
export type BarTone = Accent | "gold";
export const BAR_FILLS: Record<BarTone, string> = {
  gold: "/ui/fill-gold.webp",
  green: "/ui/fill-green.webp",
  blue: "/ui/fill-blue.webp",
  purple: "/ui/fill-purple.webp",
  orange: "/ui/fill-red.webp",
};

export const INPUT_CLASS =
  "rounded-[6px] border border-black/60 bg-black/30 px-3 py-2 text-[14px] text-text shadow-[inset_0_2px_4px_rgb(0_0_0/0.45)] placeholder:text-text-faint transition-colors focus:border-gold/60 focus:outline-none";

export const PRIMARY_BUTTON_CLASS =
  "btn-gem font-display font-semibold tracking-wide transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 disabled:opacity-60";

export const SECONDARY_BUTTON_CLASS =
  "rounded-[6px] border border-white/15 bg-black/40 font-display font-semibold tracking-wide text-text-dim shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-colors hover:border-gold/50 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50";

// Small square icon button (the gem sprite needs more width than this).
export const ICON_BUTTON_CLASS =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-gold/60 bg-black/50 text-gold shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-2px_4px_rgb(0_0_0/0.6)] transition-colors hover:border-gold hover:text-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-60";
