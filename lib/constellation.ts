import type { SkillNodeView } from "@/lib/types";

// Skyrim-style constellation layout for any skill tree: roots at the bottom,
// each tier of dependants above, x pulled toward the mean of a node's
// prerequisites, plus a small deterministic jitter so the tree reads as a
// star pattern rather than a grid. Pure arithmetic, no DOM measurement.

export const SLOT = 120; // horizontal space per star
export const ROW = 104; // vertical space per tier
const PAD_X = 64;
const PAD_TOP = 88;
const PAD_BOTTOM = 72;
const MIN_WIDTH = 340;

export interface Star {
  node: SkillNodeView;
  x: number;
  y: number;
}

export interface Constellation {
  width: number;
  height: number;
  stars: Star[];
  edges: { from: Star; to: Star }[];
}

function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000; // 0..1
}

export function layoutConstellation(nodes: SkillNodeView[]): Constellation {
  const rows = new Map<number, SkillNodeView[]>();
  for (const n of nodes) rows.set(n.tier, [...(rows.get(n.tier) ?? []), n]);
  const tiers = [...rows.keys()].sort((a, b) => a - b);
  const widest = Math.max(1, ...[...rows.values()].map((r) => r.length));
  const width = Math.max(MIN_WIDTH, PAD_X * 2 + (widest - 1) * SLOT);
  const height = PAD_TOP + PAD_BOTTOM + Math.max(0, tiers.length - 1) * ROW;
  const centerX = width / 2;

  const xOf = new Map<string, number>();
  const placed: Star[] = [];

  tiers.forEach((tier, rowIndex) => {
    const row = rows.get(tier)!;
    const y = height - PAD_BOTTOM - rowIndex * ROW;

    const target = (n: SkillNodeView, slotX: number) => {
      const xs = n.prerequisites.map((id) => xOf.get(id)).filter((v): v is number => v !== undefined);
      if (xs.length === 0) return slotX;
      const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
      return (slotX + mean) / 2;
    };

    // Even slots first, ordered by where the prerequisites sit.
    const rowWidth = (row.length - 1) * SLOT;
    const ordered = [...row].sort((a, b) => {
      const pa = a.prerequisites.map((id) => xOf.get(id) ?? centerX);
      const pb = b.prerequisites.map((id) => xOf.get(id) ?? centerX);
      const ma = pa.length ? pa.reduce((s, v) => s + v, 0) / pa.length : centerX;
      const mb = pb.length ? pb.reduce((s, v) => s + v, 0) / pb.length : centerX;
      return ma - mb || a.position - b.position;
    });
    const xs = ordered.map((n, i) => target(n, centerX - rowWidth / 2 + i * SLOT));

    // Keep stars apart after pulling them toward their parents.
    for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + SLOT * 0.8);
    const shift = Math.min(0, width - PAD_X - xs[xs.length - 1]);
    ordered.forEach((n, i) => {
      const jitterX = (hash(n.id) - 0.5) * 22;
      const jitterY = (hash(n.id + "y") - 0.5) * 30;
      const x = Math.round(Math.min(width - PAD_X, Math.max(PAD_X, xs[i] + shift + jitterX)));
      xOf.set(n.id, x);
      placed.push({ node: n, x, y: Math.round(y + jitterY) });
    });
  });

  const byId = new Map(placed.map((s) => [s.node.id, s]));
  const edges = placed.flatMap((to) =>
    to.node.prerequisites.flatMap((id) => {
      const from = byId.get(id);
      return from ? [{ from, to }] : [];
    })
  );

  return { width, height, stars: placed, edges };
}
