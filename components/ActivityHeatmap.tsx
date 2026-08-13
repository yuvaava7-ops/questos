import { Flame } from "lucide-react";
import type { DayActivity } from "@/lib/types";

const LEVEL_COLORS = ["#171d2c", "#123324", "#155a37", "#1a9150", "#22c55e"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function ActivityHeatmap({
  days,
  streakDays,
}: {
  days: DayActivity[];
  streakDays: number;
}) {
  // days is a Sunday-aligned run from lib/queries#getActivity, so every
  // consecutive run of 7 is one real calendar week (column-major, oldest first).
  const weeks: DayActivity[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const monthLabels = weeks.map((week, wi) => {
    const first = week.find((d) => d.date);
    if (!first) return null;
    const month = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
    const prevFirst = weeks[wi - 1]?.find((d) => d.date);
    const prevMonth = prevFirst ? new Date(`${prevFirst.date}T00:00:00Z`).getUTCMonth() : null;
    return month !== prevMonth ? MONTH_NAMES[month] : null;
  });

  return (
    <div className="mb-3.5 rounded-card border border-border bg-panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14.5px] font-bold">Activity</h3>
        <span className="flex items-center gap-1 text-xs text-blue">
          <Flame size={12} /> {streakDays} day streak
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-flex gap-[3px]">
          <div className="mt-[18px] flex flex-col gap-[3px] text-[10px] leading-[10px] text-text-faint">
            {WEEKDAY_LABELS.map((label, i) => (
              <div key={i} className="h-[10px] w-6">
                {label}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-[3px] text-[10px] leading-[10px] text-text-faint">
              {monthLabels.map((label, wi) => (
                <div key={wi} className="w-[10px]">
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
              {weeks.map((week, wi) =>
                week.map((day, di) =>
                  day.date ? (
                    <div
                      key={`${wi}-${di}`}
                      className="h-[10px] w-[10px] rounded-[2px]"
                      style={{ background: LEVEL_COLORS[day.level] }}
                      title={`${day.count} quest${day.count === 1 ? "" : "s"} completed on ${day.date}`}
                    />
                  ) : (
                    <div key={`${wi}-${di}`} className="h-[10px] w-[10px]" />
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-[11.5px] text-text-faint">
        Each square is a day. The more quests completed, the greener it gets.
      </div>
    </div>
  );
}
