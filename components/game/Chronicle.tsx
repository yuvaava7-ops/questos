"use client";

import { useEffect, useRef } from "react";
import type { DayActivity } from "@/lib/types";
import { Window } from "@/components/pixel/Window";

const SHADES = ["#1d1747", "#2e7d46", "#5bd96a", "#c4ff6a", "#ffd24a"];

function labelFor(day: DayActivity): string {
  return `${day.date}: ${day.count} quest${day.count === 1 ? "" : "s"}`;
}

// Activity heatmap: one square per day, columns are weeks, newest on the right.
export function Chronicle({ days, streakDays }: { days: DayActivity[]; streakDays: number }) {
  const scroller = useRef<HTMLDivElement>(null);

  // Start scrolled to today.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const active = days.filter((d) => d.count > 0).length;

  return (
    <Window title="Chronicle" right={`${streakDays}d streak`} className="mt-7">
      <div ref={scroller} className="overflow-x-auto pb-2">
        <div
          role="img"
          aria-label={`Activity over the last year: ${active} active days, current streak ${streakDays} days`}
          className="grid w-max grid-flow-col grid-rows-7 gap-[3px]"
        >
          {days.map((d, i) =>
            d.count < 0 ? (
              <div key={i} className="h-3 w-3" />
            ) : (
              <div key={i} title={labelFor(d)} className="h-3 w-3" style={{ background: SHADES[d.level] }} />
            ),
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[20px] leading-none text-faint">
        less
        {SHADES.map((c) => (
          <span key={c} className="inline-block h-3 w-3" style={{ background: c }} />
        ))}
        more
      </div>
    </Window>
  );
}
