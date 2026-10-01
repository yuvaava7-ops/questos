import type { SpriteDef } from "@/components/pixel/sprites";

// Merge horizontal runs of the same colour into one <rect> so a 16x16 sprite
// is ~40 nodes instead of ~200.
function runs(def: SpriteDef): { x: number; y: number; w: number; fill: string }[] {
  const out: { x: number; y: number; w: number; fill: string }[] = [];
  def.art.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === ".") {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      out.push({ x, y, w: end - x, fill: def.palette[ch] ?? "#ff00ff" });
      x = end;
    }
  });
  return out;
}

/** The raw rects, for composing sprites inside a bigger <svg> scene. */
export function SpriteRects({ def }: { def: SpriteDef }) {
  return (
    <>
      {runs(def).map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </>
  );
}

/** Standalone sprite. `scale` is CSS pixels per art pixel. */
export function Sprite({
  def,
  scale = 3,
  className,
  title,
}: {
  def: SpriteDef;
  scale?: number;
  className?: string;
  title?: string;
}) {
  const w = def.art[0].length;
  const h = def.art.length;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ imageRendering: "pixelated" }}
    >
      <SpriteRects def={def} />
    </svg>
  );
}
