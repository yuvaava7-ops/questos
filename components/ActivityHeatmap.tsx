import { Flame } from "lucide-react";
import type { DayActivity } from "@/lib/types";
import { Panel } from "@/components/Panel";

const LEVEL_CLASSES = ["bg-[#1c1712]", "bg-[#2c3018]", "bg-[#445a22]", "bg-[#6b8a2f]", "bg-[#94b83f]"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const CELL = 13;
const GAP = 4;

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
    <Panel
      title="Activity"
      action={
        <span className="flex items-center gap-1.5 text-[12px] text-text-faint">
          <Flame size={13} className="text-orange" /> {streakDays} day streak
        </span>
      }
    >
      {/* Reversed flex direction keeps the newest weeks in view on narrow
          screens (scroll starts at the right edge); justify-end left-aligns it
          when it fits. */}
      <div className="flex flex-row-reverse justify-end overflow-x-auto pb-1">
        <div className="inline-flex" style={{ gap: GAP }}>
          <div className="flex flex-col text-[10px] leading-[10px] text-text-faint" style={{ marginTop: 18, gap: GAP }}>
            {WEEKDAY_LABELS.map((label, i) => (
              <div key={i} style={{ height: CELL, width: 24 }}>
                {label}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex text-[10px] leading-[10px] text-text-faint" style={{ gap: GAP }}>
              {monthLabels.map((label, wi) => (
                <div key={wi} style={{ width: CELL }}>
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-flow-col grid-rows-7" style={{ gap: GAP }}>
              {weeks.map((week, wi) =>
                week.map((day, di) =>
                  day.date ? (
                    <div
                      key={day.date}
                      className={`rounded-[3px] ${LEVEL_CLASSES[day.level]}`}
                      style={{ height: CELL, width: CELL }}
                      title={`${day.count} quest${day.count === 1 ? "" : "s"} completed on ${day.date}`}
                    />
                  ) : (
                    <div key={`${wi}-${di}`} style={{ height: CELL, width: CELL }} />
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-[11.5px] text-text-faint">
        <span>Each square is a day of completed quests.</span>
        <span className="flex shrink-0 items-center gap-1" aria-hidden>
          Less
          {LEVEL_CLASSES.map((cls) => (
            <span key={cls} className={`h-2.5 w-2.5 rounded-[2px] ${cls}`} />
          ))}
          More
        </span>
      </div>
    </Panel>
  );
}
