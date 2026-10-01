import type { Accent } from "@/lib/types";
import type { BarColor } from "@/components/pixel/SegBar";

// Skill-tree accent colours, mapped onto the pixel palette.
export const ACCENT: Record<Accent, { bar: BarColor; text: string; bg: string; hex: string; hexDark: string; hexLight: string }> = {
  green: { bar: "leaf", text: "text-leaf", bg: "bg-leaf", hex: "#5bd96a", hexDark: "#2e7d46", hexLight: "#c4ffcb" },
  blue: { bar: "sky", text: "text-sky", bg: "bg-sky", hex: "#4ad8ff", hexDark: "#2a8fc4", hexLight: "#e6faff" },
  purple: { bar: "grape", text: "text-grape", bg: "bg-grape", hex: "#b377ff", hexDark: "#7a47c4", hexLight: "#e6d2ff" },
  orange: { bar: "ember", text: "text-ember", bg: "bg-ember", hex: "#ff9a3c", hexDark: "#c4621a", hexLight: "#ffd9b0" },
};
