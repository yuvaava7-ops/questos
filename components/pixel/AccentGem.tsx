import type { Accent } from "@/lib/types";
import { ACCENT } from "@/components/pixel/accent";
import { Sprite } from "@/components/pixel/Sprite";
import { GEM, tint } from "@/components/pixel/sprites";

export function AccentGem({ accent, scale = 3 }: { accent: Accent; scale?: number }) {
  const a = ACCENT[accent];
  return <Sprite def={tint(GEM, { c: a.hex, C: a.hexDark, w: a.hexLight })} scale={scale} />;
}
