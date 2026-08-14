import { Heart } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";

const METRICS = ["Steps", "Calories", "Water", "Sleep"];

export function HealthOverview() {
  return (
    <div className="rounded-card border border-border/60 bg-panel p-6">
      <SectionHeading title="Health Overview">
        <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-faint">
          Coming soon
        </span>
      </SectionHeading>
      <div className="grid grid-cols-2 gap-3">
        {METRICS.map((label) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-[10px] border border-dashed border-border/60 bg-panel2 py-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-text-faint/30 text-[13px] font-semibold text-text-faint">
              —
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
