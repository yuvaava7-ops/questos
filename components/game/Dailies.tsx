"use client";

import { useRef, useState, useTransition } from "react";
import type { Habit } from "@/lib/game-data";
import { addHabit, deleteHabit, setHabitActive } from "@/lib/game-actions";
import { STAT_KEYS, STATS, type StatKey } from "@/lib/stats";
import { sfx } from "@/lib/sfx";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { FLAME } from "@/components/pixel/sprites";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const XP_CHOICES = [5, 10, 20, 50];
const STAT_BG: Record<string, string> = { ruby: "bg-ruby", sky: "bg-sky", leaf: "bg-leaf", grape: "bg-grape", gold: "bg-gold" };
const STAT_TEXT: Record<string, string> = { ruby: "text-ruby", sky: "text-sky", leaf: "text-leaf", grape: "text-grape", gold: "text-gold" };

// Dailies repeat on chosen weekdays and appear in the Quest Log each morning.
export function Dailies({ habits }: { habits: Habit[] }) {
  const [isPending, startTransition] = useTransition();
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [xp, setXp] = useState(10);
  const [stat, setStat] = useState<StatKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Window title="Dailies" right={habits.length > 0 ? `${habits.filter((h) => h.active).length} active` : undefined} className="mt-7">
      {habits.length === 0 ? (
        <p className="mb-3 text-[23px] leading-tight text-dim">
          Habits that repeat on their own, like a nightly workout. They show up in your Quest Log every day they are due.
        </p>
      ) : (
        <ul className="mb-4 flex flex-col">
          {habits.map((h) => (
            <li key={h.id} className={`flex min-h-[48px] items-center gap-3 border-b-2 border-dusk/70 last:border-b-0 ${h.active ? "" : "opacity-50"}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[24px] leading-none text-paper">{h.label}</p>
                <p className="mt-1 flex gap-[3px] text-[16px] leading-none text-faint">
                  {DAYS.map((d, i) => (
                    <span key={i} className={h.weekdays.includes(i) ? "text-gold" : "opacity-40"}>
                      {d}
                    </span>
                  ))}
                  <span className="ml-1">· {h.xp} XP</span>
                  {h.stat && <span className={`ml-1 ${STAT_TEXT[STATS[h.stat].color]}`}>{STATS[h.stat].abbr}</span>}
                </p>
              </div>
              {h.streak > 0 && (
                <span className="flex shrink-0 items-center gap-1 text-[22px] text-ember" title="Daily streak">
                  <Sprite def={FLAME} scale={2} />
                  {h.streak}
                </span>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => setHabitActive(h.id, !h.active))}
                className="px-btn px-btn-ghost !px-2 !py-2 !text-[8px]"
              >
                {h.active ? "Pause" : "Resume"}
              </button>
              <button
                type="button"
                aria-label={`Delete ${h.label}`}
                onClick={() => {
                  if (window.confirm(`Delete the daily "${h.label}"? Past quests stay in your history.`)) startTransition(() => deleteHabit(h.id));
                }}
                className="flex h-9 w-6 shrink-0 items-center justify-center text-[28px] leading-none text-faint hover:text-ruby"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        action={(formData) => {
          sfx.tap();
          setError(null);
          formData.set("xp", String(xp));
          formData.set("weekdays", days.join(","));
          if (stat) formData.set("stat", stat);
          startTransition(async () => {
            const result = await addHabit(formData);
            if (result.error) setError(result.error);
            else formRef.current?.reset();
          });
        }}
        className="flex flex-col gap-3 border-t-2 border-dusk pt-4"
      >
        <input name="label" required maxLength={120} placeholder="New daily, e.g. 100 jumping jacks" className="px-input" autoComplete="off" />

        <div className="flex gap-1" role="group" aria-label="Days of the week">
          {DAYS.map((d, i) => {
            const on = days.includes(i);
            return (
              <button
                key={i}
                type="button"
                aria-pressed={on}
                onClick={() => setDays(on ? days.filter((x) => x !== i) : [...days, i])}
                className={`flex-1 py-2 text-[22px] leading-none ${on ? "bg-gold text-ink" : "bg-ink text-faint"} shadow-[0_-2px_0_0_#0b0820,0_2px_0_0_#0b0820,-2px_0_0_0_#0b0820,2px_0_0_0_#0b0820]`}
              >
                {d}
              </button>
            );
          })}
        </div>

        <div className="flex gap-1.5" role="radiogroup" aria-label="Stat this daily trains (optional)">
          {STAT_KEYS.map((k) => {
            const on = stat === k;
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={on}
                title={STATS[k].name}
                onClick={() => setStat(on ? null : k)}
                className={`px-title flex-1 py-2.5 text-[9px] ${on ? `${STAT_BG[STATS[k].color]} text-ink` : `bg-ink ${STAT_TEXT[STATS[k].color]}`} shadow-[0_-2px_0_0_#0b0820,0_2px_0_0_#0b0820,-2px_0_0_0_#0b0820,2px_0_0_0_#0b0820]`}
              >
                {STATS[k].abbr}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <input name="time" maxLength={12} placeholder="21:00" aria-label="Time (optional)" className="px-input !w-[88px] shrink-0" />
          <div className="flex flex-1 gap-1.5" role="radiogroup" aria-label="XP reward">
            {XP_CHOICES.map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={xp === v}
                onClick={() => setXp(v)}
                className={`flex-1 py-2 text-[22px] leading-none ${xp === v ? "bg-gold text-ink" : "bg-ink text-dim"} shadow-[0_-2px_0_0_#0b0820,0_2px_0_0_#0b0820,-2px_0_0_0_#0b0820,2px_0_0_0_#0b0820]`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[22px] text-ruby">
            ! {error}
          </p>
        )}
        <button type="submit" disabled={isPending} className="px-btn px-btn-ghost w-full">
          + Add daily
        </button>
      </form>
    </Window>
  );
}
