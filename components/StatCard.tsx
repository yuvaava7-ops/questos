import * as Icons from "lucide-react";
import type { StatCard as StatCardType } from "@/lib/types";

const BAR_COLOR_MAP = {
  green: "bg-green",
  blue: "bg-blue",
  orange: "bg-orange",
  purple: "bg-purple",
} as const;

export function StatCard({ stat }: { stat: StatCardType }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[stat.icon] ?? Icons.Circle;

  return (
    <div className="rounded-card border border-border/60 bg-panel p-5 shadow-[0_1px_0_rgba(255,255,255,0.02)_inset]">
      <div className="mb-4 flex items-center gap-2 text-[12px] font-medium tracking-wide text-text-faint">
        <Icon size={14} strokeWidth={1.75} />
        {stat.label}
      </div>
      <div className="text-[28px] font-semibold leading-none tracking-tight">
        {stat.value}
        {stat.unit && <span className="ml-1 text-[13px] font-normal text-text-faint">{stat.unit}</span>}
      </div>
      <div className="mb-4 mt-2 text-[12px] text-text-faint">{stat.sub}</div>
      <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full ${BAR_COLOR_MAP[stat.color]}`}
          style={{ width: `${stat.percent}%` }}
        />
      </div>
    </div>
  );
}
