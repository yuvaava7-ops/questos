"use client";

import { useMemo, useState } from "react";
import { Check, Lock, Hourglass } from "lucide-react";
import type { Accent, SkillNodeView, SkillNodeState } from "@/lib/types";
import { ACCENT_CLASSES } from "@/lib/theme";
import { layoutTree, NODE_H, NODE_W } from "@/lib/tree-layout";
import { NodeDetail } from "@/components/skills/NodeDetail";

const STATE_LABEL: Record<SkillNodeState, string> = {
  locked: "Locked",
  available: "Available",
  complete: "Complete",
  rusty: "Rusty",
};

function nodeClasses(state: SkillNodeState, accent: Accent, selected: boolean): string {
  const a = ACCENT_CLASSES[accent];
  const base =
    "absolute flex flex-col justify-between rounded-[12px] border px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60";
  const ring = selected ? " ring-2 ring-gold ring-offset-2 ring-offset-bg" : "";
  switch (state) {
    case "complete":
      return `${base} ${a.dim} ${a.border} ${a.glow}${ring}`;
    case "rusty":
      return `${base} border-dashed border-orange/70 bg-orange-dim/70 shadow-[0_0_20px_-8px_rgb(var(--orange)/0.7)]${ring}`;
    case "available":
      return `${base} border-gold/60 bg-panel2 shadow-[0_0_22px_-8px_rgb(var(--gold)/0.7)] hover:border-gold${ring}`;
    case "locked":
      return `${base} border-border/60 bg-bg/70 opacity-55 hover:opacity-90${ring}`;
  }
}

// The one generic renderer for every skill tree: layout comes from node
// tiers/positions, styling from node state and the tree's accent color.
export function SkillTreeGraph({
  nodes,
  accent,
  icons,
}: {
  nodes: SkillNodeView[];
  accent: Accent;
  icons: Record<string, React.ReactNode>; // node id -> server-rendered icon
}) {
  const layout = useMemo(() => layoutTree(nodes), [nodes]);
  const firstActionable = nodes.find((n) => n.state === "rusty") ?? nodes.find((n) => n.state === "available") ?? nodes[0];
  const [selectedId, setSelectedId] = useState<string | null>(firstActionable?.id ?? null);
  const selected = nodes.find((n) => n.id === selectedId) ?? null;
  const nameById = useMemo(() => new Map(nodes.map((n) => [n.id, n.name])), [nodes]);
  const a = ACCENT_CLASSES[accent];

  return (
    <div className="flex flex-col gap-4">
      <div className="surface overflow-x-auto bg-[radial-gradient(ellipse_at_top,rgb(var(--gold)/0.06),transparent_70%)]">
        <div className="relative mx-auto" style={{ width: layout.width, height: layout.height }}>
          <svg className="absolute inset-0" width={layout.width} height={layout.height} aria-hidden>
            {layout.edges.map(({ from, to }) => {
              const x1 = from.x + NODE_W / 2;
              const y1 = from.y + NODE_H;
              const x2 = to.x + NODE_W / 2;
              const y2 = to.y;
              const midY = (y1 + y2) / 2;
              return (
                <path
                  key={`${from.node.id}-${to.node.id}`}
                  d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                  fill="none"
                  strokeWidth={from.node.complete ? 2 : 1.5}
                  className={from.node.complete ? `${a.stroke} opacity-70` : "stroke-border"}
                />
              );
            })}
          </svg>

          {layout.nodes.map(({ node, x, y }) => {
            const pct = Math.round((node.xp / node.xpRequired) * 100);
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedId(node.id)}
                aria-pressed={node.id === selectedId}
                aria-label={`${node.name}, ${STATE_LABEL[node.state]}, ${node.xp} of ${node.xpRequired} XP`}
                className={nodeClasses(node.state, accent, node.id === selectedId)}
                style={{ left: x, top: y, width: NODE_W, height: NODE_H }}
              >
                <span className="flex items-start justify-between gap-1.5">
                  <span className="line-clamp-2 text-[12.5px] font-semibold leading-tight text-text">{node.name}</span>
                  {node.state === "complete" && <Check size={13} className={`shrink-0 ${a.text}`} />}
                  {node.state === "locked" && <Lock size={12} className="shrink-0 text-text-faint" />}
                  {node.state === "rusty" && <Hourglass size={12} className="shrink-0 text-orange" />}
                </span>
                <span className="block h-1 overflow-hidden rounded-full bg-white/[0.08]">
                  <span className={`block h-full rounded-full ${node.state === "rusty" ? "bg-orange" : a.bar}`} style={{ width: `${pct}%` }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selected && <NodeDetail node={selected} nameById={nameById} accent={accent} icon={icons[selected.id]} />}
    </div>
  );
}
