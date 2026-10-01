"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Accent, SkillNodeView, SkillNodeState } from "@/lib/types";
import { ACCENT } from "@/components/pixel/accent";
import { SegBar } from "@/components/pixel/SegBar";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { CHECK, HOURGLASS, LOCK } from "@/components/pixel/sprites";
import { layoutTree, NODE_H, NODE_W } from "@/lib/tree-layout";
import { NodeDetail } from "@/components/skills/NodeDetail";

const STATE_LABEL: Record<SkillNodeState, string> = {
  locked: "Locked",
  available: "Available",
  complete: "Complete",
  rusty: "Rusty",
};

function frame(color: string): string {
  return `0 -3px 0 0 ${color}, 0 3px 0 0 ${color}, -3px 0 0 0 ${color}, 3px 0 0 0 ${color}`;
}

function nodeStyle(state: SkillNodeState, accent: Accent, selected: boolean): React.CSSProperties {
  const a = ACCENT[accent];
  const rim = selected
    ? "#ffd24a"
    : state === "complete"
      ? a.hex
      : state === "available"
        ? "#f4f1ff"
        : state === "rusty"
          ? "#ff9a3c"
          : "#4a3a96";
  return {
    boxShadow: frame(rim),
    background: state === "complete" ? a.hexDark : state === "locked" ? "#120e30" : "#0b0820",
    opacity: state === "locked" ? 0.7 : 1,
  };
}

// The one generic renderer for every skill tree: layout comes from node
// tiers/positions, styling from node state and the tree's accent colour.
export function SkillTreeGraph({ nodes, accent }: { nodes: SkillNodeView[]; accent: Accent }) {
  const layout = useMemo(() => layoutTree(nodes), [nodes]);
  const firstActionable = nodes.find((n) => n.state === "rusty") ?? nodes.find((n) => n.state === "available") ?? nodes[0];
  const [selectedId, setSelectedId] = useState<string | null>(firstActionable?.id ?? null);
  const selected = nodes.find((n) => n.id === selectedId) ?? null;
  const nameById = useMemo(() => new Map(nodes.map((n) => [n.id, n.name])), [nodes]);
  const a = ACCENT[accent];
  const scroller = useRef<HTMLDivElement>(null);

  // Wide trees overflow a phone: start centred.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  return (
    <div>
      <Window bodyClassName="p-3">
        <div ref={scroller} className="overflow-x-auto">
          <div className="relative mx-auto" style={{ width: layout.width, height: layout.height }}>
            <svg className="absolute inset-0" width={layout.width} height={layout.height} aria-hidden shapeRendering="crispEdges">
              {layout.edges.map(({ from, to }) => {
                const x1 = Math.round(from.x + NODE_W / 2);
                const y1 = from.y + NODE_H;
                const x2 = Math.round(to.x + NODE_W / 2);
                const y2 = to.y;
                const midY = Math.round((y1 + y2) / 2);
                // Right-angle routing keeps the connector lines pixel-clean.
                return (
                  <path
                    key={`${from.node.id}-${to.node.id}`}
                    d={`M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`}
                    fill="none"
                    stroke={from.node.complete ? a.hex : "#4a3a96"}
                    strokeWidth={3}
                  />
                );
              })}
            </svg>

            {layout.nodes.map(({ node, x, y }) => (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedId(node.id)}
                aria-pressed={node.id === selectedId}
                aria-label={`${node.name}, ${STATE_LABEL[node.state]}, ${node.xp} of ${node.xpRequired} XP`}
                className="absolute flex flex-col justify-between px-2.5 py-2 text-left"
                style={{ left: x, top: y, width: NODE_W, height: NODE_H, ...nodeStyle(node.state, accent, node.id === selectedId) }}
              >
                <span className="flex items-start justify-between gap-1.5">
                  <span className="line-clamp-2 text-[20px] leading-[0.95] text-paper">{node.name}</span>
                  {node.state === "complete" && <Sprite def={CHECK} scale={2} className="mt-0.5 shrink-0 bg-paper" />}
                  {node.state === "locked" && <Sprite def={LOCK} scale={2} className="shrink-0" />}
                  {node.state === "rusty" && <Sprite def={HOURGLASS} scale={2} className="shrink-0" />}
                </span>
                <SegBar
                  fraction={node.xp / node.xpRequired}
                  color={node.state === "rusty" ? "ember" : a.bar}
                  segments={10}
                  label={`${node.name} XP`}
                />
              </button>
            ))}
          </div>
        </div>
      </Window>

      {selected && <NodeDetail node={selected} nameById={nameById} accent={accent} />}
    </div>
  );
}
