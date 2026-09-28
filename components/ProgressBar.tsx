import { BAR_TONES, type BarTone } from "@/lib/theme";

export function ProgressBar({
  percent,
  tone = "gold",
  size = "md",
  label,
}: {
  percent: number;
  tone?: BarTone;
  size?: "sm" | "md";
  label?: string;
}) {
  const value = Math.min(100, Math.max(0, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/[0.03] ${size === "sm" ? "h-1" : "h-1.5"}`}
    >
      <div className={`h-full rounded-full transition-[width] duration-700 ease-out ${BAR_TONES[tone]}`} style={{ width: `${value}%` }} />
    </div>
  );
}
