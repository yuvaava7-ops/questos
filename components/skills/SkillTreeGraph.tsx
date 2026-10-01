"use client";

import { useMemo, useState } from "react";
import type { SkillNodeState, SkillTreeView } from "@/lib/types";
import { ACCENT } from "@/components/pixel/accent";
import { SpriteRects } from "@/components/pixel/Sprite";
import { STAR_NODE, tint } from "@/components/pixel/sprites";
import { layoutConstellation, type Star } from "@/lib/constellation";
import { NodeDetail } from "@/components/skills/NodeDetail";

const STATE_LABEL: Record<SkillNodeState, string> = {
  locked: "Locked",
  available: "Available",
  complete: "Complete",
  rusty: "Rusty",
};

const STAR_SCALE = 3;
const STAR_SIZE = 7 * STAR_SCALE;

// Deterministic background dust (same on server and client).
const DUST = Array.from({ length: 70 }, (_, i) => {
  const a = (i * 2654435761) >>> 0;
  return { x: (a % 1000) / 1000, y: ((a >>> 10) % 1000) / 1000, big: i % 9 === 0, twinkle: i % 4 === 0 };
});

function starColors(star: Star, accentHex: string) {
  switch (star.node.state) {
    case "complete":
      return { body: "#ffd24a", core: "#fff6c9", glow: accentHex, line: accentHex };
    case "available":
      return { body: "#e6faff", core: "#ffffff", glow: "#4ad8ff", line: "#4a3a96" };
    case "rusty":
      return { body: "#ff9a3c", core: "#ffd9b0", glow: "#ff9a3c", line: "#4a3a96" };
    case "locked":
      return { body: "#5a4fa8", core: "#7d77b8", glow: "#2b1f5c", line: "#2b1f5c" };
  }
}

function short(name: string): string {
  return name.length > 16 ? `${name.slice(0, 15)}…` : name;
}

// The one generic renderer for every skill tree, drawn as a Skyrim-style
// constellation: roots at the bottom, perks as stars, lines for prerequisites.
export function SkillTreeGraph({ tree }: { tree: SkillTreeView }) {
  const { nodes } = tree;
  const layout = useMemo(() => layoutConstellation(nodes), [nodes]);
  const firstActionable = nodes.find((n) => n.state === "rusty") ?? nodes.find((n) => n.state === "available") ?? nodes[0];
  const [selectedId, setSelectedId] = useState<string | null>(firstActionable?.id ?? null);
  const selected = nodes.find((n) => n.id === selectedId) ?? null;
  const nameById = useMemo(() => new Map(nodes.map((n) => [n.id, n.name])), [nodes]);
  const a = ACCENT[tree.color];

  return (
    <div className="mt-2 bg-gradient-to-b from-[#05030f] via-[#0b0820] to-[#17123a] shadow-[0_-4px_0_0_#f4f1ff,0_4px_0_0_#f4f1ff,-4px_0_0_0_#f4f1ff,4px_0_0_0_#f4f1ff,0_-8px_0_0_#0b0820,0_8px_0_0_#0b0820,-8px_0_0_0_#0b0820,8px_0_0_0_#0b0820]">
      {/* Skyrim-style title block */}
      <header className="px-4 pt-6 text-center">
        <h1 className="px-title break-words text-[16px] tracking-[0.3em] text-paper lg:text-[22px]">{tree.name}</h1>
        <div className="mx-auto mt-3 flex max-w-[260px] items-center gap-3">
          <span className="h-[3px] flex-1" style={{ background: `linear-gradient(90deg, transparent, ${a.hex})` }} />
          <span className="h-2 w-2 rotate-45" style={{ background: a.hex }} />
          <span className="h-[3px] flex-1" style={{ background: `linear-gradient(270deg, transparent, ${a.hex})` }} />
        </div>
        <p className={`mt-3 text-[24px] leading-none ${a.text}`}>
          {tree.completeCount} of {nodes.length} perks · {tree.percent}%
          {tree.rustyCount > 0 && <span className="text-ember"> · {tree.rustyCount} rusty</span>}
        </p>
      </header>

      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="mx-auto block h-auto w-full"
          style={{ maxWidth: Math.max(layout.width * 1.5, 640), minWidth: Math.min(layout.width, 340) }}
          shapeRendering="crispEdges"
          role="group"
          aria-label={`${tree.name} constellation`}
        >
          {/* dust */}
          {DUST.map((d, i) => (
            <rect
              key={i}
              x={Math.round(d.x * layout.width)}
              y={Math.round(d.y * layout.height)}
              width={d.big ? 2 : 1}
              height={d.big ? 2 : 1}
              fill="#b9b4e6"
              opacity={d.big ? 0.7 : 0.35}
              className={d.twinkle ? "anim-twinkle" : undefined}
              style={d.twinkle ? { animationDelay: `${(i % 7) * 0.3}s` } : undefined}
            />
          ))}

          {/* constellation lines */}
          {layout.edges.map(({ from, to }) => {
            const lit = from.node.complete;
            const col = lit ? a.hex : "#3a2f7a";
            return (
              <g key={`${from.node.id}-${to.node.id}`}>
                {lit && <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={col} strokeWidth={7} opacity={0.18} />}
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={col} strokeWidth={lit ? 2 : 1} opacity={lit ? 0.95 : 0.9} />
              </g>
            );
          })}

          {/* perk stars */}
          {layout.stars.map((star) => {
            const c = starColors(star, a.hex);
            const isSel = star.node.id === selectedId;
            const bright = star.node.state !== "locked";
            const def = tint(STAR_NODE, { w: c.body, c: c.core });
            const half = STAR_SIZE / 2;
            return (
              <g
                key={star.node.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={`${star.node.name}, ${STATE_LABEL[star.node.state]}, ${star.node.xp} of ${star.node.xpRequired} XP`}
                onClick={() => setSelectedId(star.node.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(star.node.id);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                {/* generous hit area */}
                <rect x={star.x - 40} y={star.y - 30} width={80} height={64} fill="transparent" />
                {bright && (
                  <>
                    <rect x={star.x - 18} y={star.y - 18} width={36} height={36} fill={c.glow} opacity={0.1} />
                    <rect x={star.x - 12} y={star.y - 12} width={24} height={24} fill={c.glow} opacity={0.18} />
                  </>
                )}
                <g transform={`translate(${star.x - half} ${star.y - half}) scale(${STAR_SCALE})`}>
                  <SpriteRects def={def} />
                </g>
                {isSel && (
                  <g className="anim-blink" fill="none" stroke="#ffd24a" strokeWidth={2}>
                    <path d={`M ${star.x - 20} ${star.y - 12} v -8 h 8 M ${star.x + 20} ${star.y - 12} v -8 h -8 M ${star.x - 20} ${star.y + 12} v 8 h 8 M ${star.x + 20} ${star.y + 12} v 8 h -8`} />
                  </g>
                )}
                <text
                  x={star.x}
                  y={star.y + 34}
                  textAnchor="middle"
                  fontSize={17}
                  fill={isSel ? "#ffd24a" : bright ? "#f4f1ff" : "#6a63a8"}
                  style={{ fontFamily: "var(--font-body), monospace", paintOrder: "stroke", stroke: "#0b0820", strokeWidth: 4 }}
                >
                  {short(star.node.name)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selected && <NodeDetail node={selected} nameById={nameById} accent={tree.color} />}
    </div>
  );
}
