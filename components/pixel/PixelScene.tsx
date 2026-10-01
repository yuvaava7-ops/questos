"use client";

import { useEffect, useState } from "react";
import { SpriteRects } from "@/components/pixel/Sprite";
import { CASTLE, HERO_A, HERO_B, STAR } from "@/components/pixel/sprites";

const W = 192;
const H = 108;
const HORIZON = 72;

type TimeOfDay = "day" | "dusk" | "night";

interface Palette {
  sky: [string, string, string]; // top, middle, horizon — stepped into bands
  orb: string;
  orbGlow: string;
  orbPos: [number, number];
  stars: number; // 0..1 how many stars are visible
  far: string;
  near: string;
  hillShade: string;
  tree: string;
  treeDark: string;
  grass: string;
  grassDark: string;
  path: string;
  pathDark: string;
  cloud: string;
}

const PALETTES: Record<TimeOfDay, Palette> = {
  day: {
    sky: ["#3f8fe8", "#7cc4ff", "#d4f1ff"],
    orb: "#fff6a8",
    orbGlow: "#ffffff",
    orbPos: [146, 20],
    stars: 0,
    far: "#8fb0e8",
    near: "#5e9b78",
    hillShade: "#4a8a68",
    tree: "#2f8f4a",
    treeDark: "#1f6a38",
    grass: "#5bd96a",
    grassDark: "#3fae52",
    path: "#e0a96a",
    pathDark: "#b57a42",
    cloud: "#ffffff",
  },
  dusk: {
    sky: ["#1a1250", "#a0407e", "#ffc27a"],
    orb: "#ffd24a",
    orbGlow: "#ff9a3c",
    orbPos: [138, 60],
    stars: 0.55,
    far: "#5a3a8a",
    near: "#2f2a66",
    hillShade: "#241f52",
    tree: "#1b3a5a",
    treeDark: "#12294a",
    grass: "#3d8f6a",
    grassDark: "#2a6a52",
    path: "#a86a4a",
    pathDark: "#7d4a38",
    cloud: "#ff9fb0",
  },
  night: {
    sky: ["#05030f", "#150e3d", "#2b1f5c"],
    orb: "#e8ecff",
    orbGlow: "#8a96ff",
    orbPos: [146, 22],
    stars: 1,
    far: "#231a55",
    near: "#15103a",
    hillShade: "#0f0b2c",
    tree: "#0f3a3a",
    treeDark: "#0a2a2e",
    grass: "#1f6b4a",
    grassDark: "#164f3a",
    path: "#5b4a7a",
    pathDark: "#3d3260",
    cloud: "#3a3070",
  },
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${c(ar, br)},${c(ag, bg)},${c(ab, bb)})`;
}

const BANDS = 12;
function skyBands(p: Palette): string[] {
  return Array.from({ length: BANDS }, (_, i) => {
    const t = i / (BANDS - 1);
    return t < 0.5 ? mix(p.sky[0], p.sky[1], t * 2) : mix(p.sky[1], p.sky[2], (t - 0.5) * 2);
  });
}

// Deterministic star field (same on server and client, so no hydration mismatch).
const STARS = (() => {
  let s = 7;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  return Array.from({ length: 34 }, (_, i) => ({
    x: Math.floor(rnd() * W),
    y: Math.floor(rnd() * 46),
    big: i % 7 === 0,
    twinkle: i % 3 === 0,
    delay: (i % 5) * 0.4,
  }));
})();

const COL = 4;
// Periodic over W so the layer can scroll seamlessly: only integer frequencies.
function ridge(a: number, b: number, c: number, base: number, phase: number): number[] {
  return Array.from({ length: W / COL }, (_, i) => {
    const t = (i * COL) / W;
    const h =
      a * Math.sin(2 * Math.PI * (2 * t) + phase) +
      b * Math.sin(2 * Math.PI * (5 * t) + phase * 1.7) +
      c * Math.sin(2 * Math.PI * (9 * t));
    return Math.round((base + h) / 2) * 2; // snap to 2px steps for chunkier stairs
  });
}

const FAR = ridge(9, 4, 1.5, 20, 0.6);
const NEAR = ridge(7, 3, 1, 12, 2.2);
const TREES = [6, 22, 31, 52, 68, 83, 97, 118, 133, 149, 166, 181];

function Ridge({ heights, fill, shade, baseY }: { heights: number[]; fill: string; shade?: string; baseY: number }) {
  return (
    <g>
      {heights.map((h, i) => (
        <g key={i}>
          <rect x={i * COL} y={baseY - h} width={COL} height={h + 1} fill={fill} />
          {shade && <rect x={i * COL} y={baseY - h + 4} width={COL} height={Math.max(0, h - 3)} fill={shade} opacity={0.5} />}
        </g>
      ))}
    </g>
  );
}

function Pine({ x, y, tree, dark }: { x: number; y: number; tree: string; dark: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={3} y={9} width={2} height={3} fill="#4a2c18" />
      <rect x={3} y={0} width={1} height={1} fill={tree} />
      <rect x={2} y={1} width={3} height={2} fill={tree} />
      <rect x={1} y={3} width={5} height={2} fill={dark} />
      <rect x={2} y={3} width={3} height={2} fill={tree} />
      <rect x={0} y={5} width={7} height={2} fill={dark} />
      <rect x={1} y={5} width={5} height={2} fill={tree} />
      <rect x={0} y={7} width={7} height={2} fill={dark} />
    </g>
  );
}

function Cloud({ y, delay, dur, color }: { y: number; delay: number; dur: number; color: string }) {
  return (
    <g
      data-motion
      style={{ animation: `px-drift ${dur}s steps(${Math.round(dur * 2)}) ${-delay}s infinite` }}
      opacity={0.9}
    >
      <rect x={4} y={y + 2} width={22} height={3} fill={color} />
      <rect x={8} y={y} width={8} height={3} fill={color} />
      <rect x={14} y={y + 1} width={8} height={2} fill={color} />
    </g>
  );
}

function Orb({ p }: { p: Palette }) {
  const [cx, cy] = p.orbPos;
  const disc = (r: number, fill: string, opacity = 1) =>
    Array.from({ length: r * 2 + 1 }, (_, i) => {
      const dy = i - r;
      const dx = Math.floor(Math.sqrt(r * r - dy * dy));
      return <rect key={`${r}-${i}`} x={cx - dx} y={cy + dy} width={dx * 2 + 1} height={1} fill={fill} opacity={opacity} />;
    });
  return (
    <g>
      {disc(14, p.orbGlow, 0.12)}
      {disc(11, p.orbGlow, 0.2)}
      {disc(8, p.orb)}
    </g>
  );
}

interface PixelSceneProps {
  /** "title" scrolls the world around a walking hero; "journey" walks the hero toward the castle. */
  mode: "title" | "journey";
  /** 0..1, journey mode only. */
  progress?: number;
  className?: string;
}

export function PixelScene({ mode, progress = 0, className }: PixelSceneProps) {
  const [tod, setTod] = useState<TimeOfDay>("dusk");

  useEffect(() => {
    const hour = new Date().getHours();
    setTod(hour >= 7 && hour < 17 ? "day" : hour >= 17 && hour < 20 ? "dusk" : "night");
  }, []);

  const p = PALETTES[tod];
  const bands = skyBands(p);
  const scrolling = mode === "title";
  const done = mode === "journey" && progress >= 1;

  const heroX = mode === "title" ? 84 : 8 + Math.min(1, Math.max(0, progress)) * 138;
  const heroY = 83;

  // Wrap a layer in two copies when it scrolls, so it loops without a seam.
  const layer = (key: string, seconds: number, node: React.ReactNode) =>
    scrolling ? (
      <g key={key} data-motion style={{ animation: `px-scroll ${seconds}s linear infinite` }}>
        <g>{node}</g>
        <g transform={`translate(${W} 0)`}>{node}</g>
      </g>
    ) : (
      <g key={key}>{node}</g>
    );

  return (
    <div className={`relative overflow-hidden scanlines ${className ?? ""}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        shapeRendering="crispEdges"
        role="img"
        aria-label={mode === "title" ? "A hero walks through a pixel landscape" : `Journey progress ${Math.round(progress * 100)} percent`}
      >
        {/* sky */}
        {bands.map((c, i) => (
          <rect key={i} x={0} y={(i * HORIZON) / BANDS} width={W} height={HORIZON / BANDS + 1} fill={c} />
        ))}

        {/* stars */}
        {STARS.filter((_, i) => i / STARS.length < p.stars).map((s, i) => (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width={s.big ? 2 : 1}
            height={s.big ? 2 : 1}
            fill="#f4f1ff"
            className={s.twinkle ? "anim-twinkle" : undefined}
            style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
          />
        ))}

        <Orb p={p} />

        <Cloud y={14} delay={0} dur={46} color={p.cloud} />
        <Cloud y={30} delay={18} dur={62} color={p.cloud} />

        {layer("far", 90, <Ridge heights={FAR} fill={p.far} baseY={HORIZON + 6} />)}
        {layer("near", 45, <Ridge heights={NEAR} fill={p.near} shade={p.hillShade} baseY={HORIZON + 14} />)}
        {layer(
          "trees",
          24,
          <g>
            {TREES.map((x, i) => (
              <Pine key={x} x={x} y={HORIZON + 4 + (i % 3) * 2} tree={p.tree} dark={p.treeDark} />
            ))}
          </g>,
        )}

        {/* ground */}
        <rect x={0} y={84} width={W} height={H - 84} fill={p.grassDark} />
        <rect x={0} y={84} width={W} height={4} fill={p.grass} />
        {layer(
          "grass-tufts",
          6,
          <g fill={p.grass}>
            {[10, 40, 71, 102, 133, 164].map((x, i) => (
              <g key={x}>
                <rect x={x} y={89 + (i % 2) * 14} width={1} height={2} />
                <rect x={x + 2} y={88 + (i % 2) * 14} width={1} height={3} />
              </g>
            ))}
          </g>,
        )}
        <rect x={0} y={92} width={W} height={10} fill={p.pathDark} />
        <rect x={0} y={92} width={W} height={8} fill={p.path} />
        <rect x={0} y={92} width={W} height={1} fill="#ffffff" opacity={0.2} />
        {layer(
          "path-dash",
          3,
          <g fill={p.pathDark}>
            {[6, 38, 70, 102, 134, 166].map((x) => (
              <rect key={x} x={x} y={96} width={6} height={1} />
            ))}
          </g>,
        )}

        {/* destination */}
        {mode === "journey" && (
          <g transform={`translate(${W - 28} ${HORIZON + 8})`}>
            <SpriteRects def={CASTLE} />
          </g>
        )}

        {/* hero */}
        <g
          style={{
            transform: `translate(${heroX}px, ${heroY}px)`,
            transition: scrolling ? undefined : "transform 1.2s steps(12)",
          }}
        >
          {done ? (
            <g className="anim-bob">
              <SpriteRects def={HERO_B} />
            </g>
          ) : (
            <>
              <g className="anim-frame-a">
                <SpriteRects def={HERO_A} />
              </g>
              <g className="anim-frame-b">
                <SpriteRects def={HERO_B} />
              </g>
            </>
          )}
          {/* ground shadow */}
          <rect x={3} y={16} width={10} height={1} fill="#000" opacity={0.3} />
        </g>

        {done &&
          [0, 1, 2].map((i) => (
            <g
              key={i}
              className="anim-twinkle"
              style={{ animationDelay: `${i * 0.3}s`, transform: `translate(${heroX - 6 + i * 11}px, ${70 - (i % 2) * 8}px)` }}
            >
              <SpriteRects def={STAR} />
            </g>
          ))}
      </svg>
    </div>
  );
}
