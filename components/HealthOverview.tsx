import { Heart } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";

const METRICS = [
  { label: "Steps", color: "#7c9a6b" },
  { label: "Calories", color: "#c8703f" },
  { label: "Water", color: "#6a94a8" },
  { label: "Sleep", color: "#8b6fa8" },
];

const SIZE = 56;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Empty ring gauges: the track is tinted per metric so each one still
// reads as visually distinct, but the progress arc stays at 0 — no data
// exists yet, so nothing implies otherwise.
function RingGauge({ color }: { color: string }) {
  return (
    <svg width={SIZE} height={SIZE} className="-rotate-90">
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeOpacity={0.18}
        strokeWidth={STROKE}
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE}
      />
    </svg>
  );
}

export function HealthOverview() {
  return (
    <div className="rounded-card border border-border/60 bg-panel p-6">
      <SectionHeading title="Health Overview">
        <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-faint">
          Coming soon
        </span>
      </SectionHeading>
      <div className="grid grid-cols-2 gap-3">
        {METRICS.map(({ label, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-[10px] border border-border/60 bg-panel2 py-4"
          >
            <div className="relative flex items-center justify-center">
              <RingGauge color={color} />
              <span className="absolute text-[13px] font-semibold text-text-faint">—</span>
            </div>
            <span className="text-[11px] text-text-faint">{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-[12px] text-text-faint">
        <Heart size={13} /> Manual health logging is planned for a future update.
      </p>
    </div>
  );
}
