import type { DayActivity } from "@/lib/types";

const LEVEL_COLORS = ["#171d2c", "#123324", "#155a37", "#1a9150", "#22c55e"];

export function ActivityHeatmap({
  days,
  streakDays,
}: {
  days: DayActivity[];
  streakDays: number;
}) {
  // group into weeks of 7 (column-major, oldest to newest)
  const weeks: DayActivity[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="mb-3.5 rounded-card border border-border bg-panel p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-[14.5px] font-bold">Activity</h3>
        <span className="text-xs text-blue">🔥 {streakDays} day streak →</span>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[560px] grid-flow-col grid-rows-7 gap-[3px]">
          {weeks.map((week, wi) =>
            week.map((day, di) => (
              <div
                key={`${wi}-${di}`}
                className="h-3 w-3 rounded-[3px]"
                style={{ background: LEVEL_COLORS[day.level] }}
                title={day.date}
              />
            ))
          )}
        </div>
      </div>
      <div className="mt-3 text-[11.5px] text-text-faint">
        Each square is a day. The more quests completed, the greener it gets.
      </div>
    </div>
  );
}
