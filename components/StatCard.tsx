import type { StatCard as StatCardType } from "@/lib/types";
import { ACCENT_CLASSES } from "@/lib/theme";
import { DynamicIcon } from "@/components/DynamicIcon";
import { ProgressBar } from "@/components/ProgressBar";

export function StatCard({ stat }: { stat: StatCardType }) {
  return (
    <div className="frame p-5">
      <div className="mb-4 flex items-center gap-2 text-[12px] font-medium tracking-wide text-text-faint">
        <DynamicIcon name={stat.icon} size={14} strokeWidth={1.75} className={ACCENT_CLASSES[stat.color].text} />
        {stat.label}
      </div>
      <div className="text-[28px] font-semibold leading-none tracking-tight">
        {stat.value}
        {stat.unit && <span className="ml-1 text-[13px] font-normal text-text-faint">{stat.unit}</span>}
      </div>
      <div className="mb-4 mt-2 text-[12px] text-text-faint">{stat.sub}</div>
      <ProgressBar percent={stat.percent} tone={stat.color} label={stat.label} />
    </div>
  );
}
