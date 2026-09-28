import { BAR_FILLS, type BarTone } from "@/lib/theme";

// Steel track (9-slice sprite) with a painted fill.
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
      className={`relative w-full bg-black/60 ${size === "sm" ? "h-2.5" : "h-3.5"}`}
      style={{ border: "4px solid transparent", borderImage: "url(/ui/bar-track.webp) 18 fill / 4px stretch" }}
    >
      <div
        className="h-full transition-[width] duration-700 ease-out"
        style={{ width: `${value}%`, backgroundImage: `url(${BAR_FILLS[tone]})`, backgroundSize: "100% 100%" }}
      />
    </div>
  );
}
