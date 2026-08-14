import * as Icons from "lucide-react";
import type { StatCard as StatCardType } from "@/lib/types";

const BAR_COLOR_MAP = {
  green: "bg-green",
  blue: "bg-blue",
  orange: "bg-orange",
  purple: "bg-purple",
} as const;

const BADGE_COLOR_MAP = {
  green: "bg-green-dim text-green",
  blue: "bg-blue-dim text-blue",
  orange: "bg-orange-dim text-orange",
  purple: "bg-purple-dim text-purple",
} as const;

export function StatCard({ stat }: { stat: StatCardType }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[stat.icon] ?? Icons.Circle;

  return (
    <div className="rounded-card border border-border bg-panel p-4">
      <div className="mb-3 flex items-center gap-2 text-[12.5px] font-semibold text-text-dim">
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${BADGE_COLOR_MAP[stat.color]}`}>
          <Icon size={13} />
        </div>
        {stat.label}
      </div>
      <div className="text-[26px] font-extrabold leading-none">
        {stat.value}
        {stat.unit && <span className="ml-1 text-[13px] font-medium text-text-faint">{stat.unit}</span>}
      </div>
      <div className="mb-3 mt-1.5 text-[11.5px] text-text-faint">{stat.sub}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#1c2233]">
        <div
          className={`h-full rounded-full ${BAR_COLOR_MAP[stat.color]}`}
          style={{ width: `${stat.percent}%` }}
        />
      </div>
    </div>
  );
}
