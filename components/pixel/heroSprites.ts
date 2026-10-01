import type { StatKey } from "@/lib/stats";
import type { Avatar } from "@/lib/avatar";
import { HERO_A, HERO_B, tint, type SpriteDef } from "@/components/pixel/sprites";

// The default hero's outfit changes colour with the dominant stat, so the class
// shows. b = tunic, B = trousers, R = scarf.
const OUTFITS: Record<StatKey, Record<string, string>> = {
  str: { b: "#e8344f", B: "#9a1f35", R: "#ffd24a" },
  int: { b: "#8a5cff", B: "#4b2a9a", R: "#4ad8ff" },
  dex: { b: "#3fae52", B: "#1f6a38", R: "#ff9a3c" },
  wis: { b: "#ff9a3c", B: "#c4621a", R: "#f4f1ff" },
  cha: { b: "#ffd24a", B: "#c48a1a", R: "#ff4d6d" },
};

export interface HeroFrames {
  a: SpriteDef;
  b: SpriteDef;
  /** True when both frames are the same drawing, so the scene should bob instead of stepping. */
  single: boolean;
}

// A player-drawn avatar (via MCP) replaces the default hero everywhere.
export function heroFrames(primary: StatKey | null, avatar?: Avatar | null): HeroFrames {
  if (avatar) {
    const a: SpriteDef = { art: avatar.art, palette: avatar.palette };
    const b: SpriteDef = avatar.walk ? { art: avatar.walk, palette: avatar.palette } : a;
    return { a, b, single: !avatar.walk };
  }
  if (!primary) return { a: HERO_A, b: HERO_B, single: false };
  return { a: tint(HERO_A, OUTFITS[primary]), b: tint(HERO_B, OUTFITS[primary]), single: false };
}
