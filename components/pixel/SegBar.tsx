const FILL: Record<string, { on: string; hi: string }> = {
  gold: { on: "#ffd24a", hi: "#fff6c9" },
  leaf: { on: "#5bd96a", hi: "#c4ffcb" },
  sky: { on: "#4ad8ff", hi: "#d4f6ff" },
  grape: { on: "#b377ff", hi: "#e6d2ff" },
  ember: { on: "#ff9a3c", hi: "#ffd9b0" },
  ruby: { on: "#ff4d6d", hi: "#ffc4cf" },
};

export type BarColor = keyof typeof FILL;

// Chunky segmented gauge — HP/MP-bar style.
export function SegBar({
  fraction,
  color = "gold",
  segments = 20,
  label,
}: {
  fraction: number;
  color?: BarColor;
  segments?: number;
  label: string;
}) {
  const lit = Math.round(Math.min(1, Math.max(0, fraction)) * segments);
  const c = FILL[color];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fraction * 100)}
      className="flex h-4 gap-[2px] bg-ink p-[2px] shadow-[0_-2px_0_0_#4a3a96,0_2px_0_0_#4a3a96,-2px_0_0_0_#4a3a96,2px_0_0_0_#4a3a96]"
    >
      {Array.from({ length: segments }, (_, i) => (
        <div
          key={i}
          className="flex-1"
          style={{
            background: i < lit ? c.on : "#1d1747",
            boxShadow: i < lit ? `inset 0 3px 0 0 ${c.hi}` : undefined,
          }}
        />
      ))}
    </div>
  );
}
