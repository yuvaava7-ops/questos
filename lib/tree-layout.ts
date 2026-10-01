import type { SkillNodeView } from "@/lib/types";

// Deterministic grid layout for any skill tree: one row per tier (roots at
// the top), nodes centered within their row. Pure arithmetic, no DOM
// measurement.

export const NODE_W = 136;
export const NODE_H = 64;
const COL_GAP = 16;
const ROW_GAP = 56;
const PAD = 16;

export interface PositionedNode {
  node: SkillNodeView;
  x: number;
  y: number;
}

export interface TreeLayout {
  width: number;
  height: number;
  nodes: PositionedNode[];
  edges: { from: PositionedNode; to: PositionedNode }[];
}

export function layoutTree(nodes: SkillNodeView[]): TreeLayout {
  const rows = new Map<number, SkillNodeView[]>();
  for (const n of nodes) rows.set(n.tier, [...(rows.get(n.tier) ?? []), n]);
  const tiers = [...rows.keys()].sort((a, b) => a - b);
  const widest = Math.max(1, ...[...rows.values()].map((r) => r.length));
  const width = PAD * 2 + widest * NODE_W + (widest - 1) * COL_GAP;

  // Barycenter ordering: after the first row, each node sits near the mean
  // column of its prerequisites, which removes most edge crossings. Stored
  // `position` only breaks ties (and orders the root row).
  const columnOf = new Map<string, number>();
  const barycenter = (n: SkillNodeView) => {
    const cols = n.prerequisites.map((id) => columnOf.get(id)).filter((c): c is number => c !== undefined);
    return cols.length > 0 ? cols.reduce((a, b) => a + b, 0) / cols.length : Infinity;
  };

  const positioned: PositionedNode[] = [];
  tiers.forEach((tier, rowIndex) => {
    const row = rows.get(tier)!.sort((a, b) => barycenter(a) - barycenter(b) || a.position - b.position);
    const rowWidth = row.length * NODE_W + (row.length - 1) * COL_GAP;
    const startX = (width - rowWidth) / 2;
    row.forEach((node, i) => {
      const x = startX + i * (NODE_W + COL_GAP);
      // Column in absolute units so rows of different widths compare fairly.
      columnOf.set(node.id, (x + NODE_W / 2) / (NODE_W + COL_GAP));
      positioned.push({ node, x, y: PAD + rowIndex * (NODE_H + ROW_GAP) });
    });
  });

  const byId = new Map(positioned.map((p) => [p.node.id, p]));
  const edges = positioned.flatMap((to) =>
    to.node.prerequisites.flatMap((id) => {
      const from = byId.get(id);
      return from ? [{ from, to }] : [];
    })
  );

  return {
    width,
    height: PAD * 2 + tiers.length * NODE_H + Math.max(0, tiers.length - 1) * ROW_GAP,
    nodes: positioned,
    edges,
  };
}
