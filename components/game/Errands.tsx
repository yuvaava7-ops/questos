"use client";

import { useRef, useState, useTransition } from "react";
import type { Task } from "@/lib/types";
import { addTask, deleteTask, toggleTask } from "@/lib/actions";
import { sfx } from "@/lib/sfx";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { CHECK, SWORD } from "@/components/pixel/sprites";

const PRIORITY: Record<Task["priority"], { label: string; color: string }> = {
  high: { label: "HI", color: "bg-ruby" },
  medium: { label: "MD", color: "bg-gold" },
  low: { label: "LO", color: "bg-sky" },
};

const ORDER: Task["priority"][] = ["high", "medium", "low"];

// Side errands: the lightweight to-do list that doesn't award XP.
export function Errands({ tasks }: { tasks: Task[] }) {
  const [, startTransition] = useTransition();
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const formRef = useRef<HTMLFormElement>(null);

  const rows = tasks.map((t) => ({ ...t, done: overrides[t.id] ?? t.done }));
  const open = rows.filter((t) => !t.done).length;

  return (
    <Window title="Side Errands" right={rows.length > 0 ? `${open} open` : undefined} className="mt-7">
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-3 text-center">
          <Sprite def={SWORD} scale={5} />
          <p className="text-[24px] text-dim">No errands. Quiet on the road.</p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {rows.map((t) => (
            <li key={t.id} className="flex min-h-[48px] items-center gap-3 border-b-2 border-dusk/70 last:border-b-0">
              <button
                type="button"
                aria-pressed={t.done}
                aria-label={`Mark "${t.label}" as ${t.done ? "not done" : "done"}`}
                onClick={() => {
                  const next = !t.done;
                  setOverrides((o) => ({ ...o, [t.id]: next }));
                  if (next) sfx.coin();
                  else sfx.undo();
                  startTransition(async () => {
                    try {
                      await toggleTask(t.id, next);
                    } finally {
                      setOverrides((o) => {
                        const { [t.id]: _drop, ...rest } = o;
                        return rest;
                      });
                    }
                  });
                }}
                className={`flex h-9 w-9 shrink-0 items-center justify-center shadow-[0_-3px_0_0_#f4f1ff,0_3px_0_0_#f4f1ff,-3px_0_0_0_#f4f1ff,3px_0_0_0_#f4f1ff] ${
                  t.done ? "bg-leaf" : "bg-ink"
                }`}
              >
                {t.done && <Sprite def={CHECK} scale={3} />}
              </button>
              <span className={`min-w-0 flex-1 break-words text-[24px] leading-tight ${t.done ? "text-faint line-through" : "text-paper"}`}>
                {t.label}
              </span>
              <span className={`px-title shrink-0 px-1.5 py-1 text-[8px] text-ink ${PRIORITY[t.priority].color}`}>
                {PRIORITY[t.priority].label}
              </span>
              <button
                type="button"
                onClick={() => {
                  sfx.undo();
                  startTransition(() => deleteTask(t.id));
                }}
                aria-label={`Delete "${t.label}"`}
                className="flex h-9 w-7 shrink-0 items-center justify-center text-[28px] leading-none text-faint hover:text-ruby"
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
          formData.set("priority", priority);
          startTransition(async () => {
            await addTask(formData);
            formRef.current?.reset();
          });
        }}
        className="mt-4 flex flex-col gap-3 border-t-2 border-dusk pt-4"
      >
        <input name="label" required maxLength={120} placeholder="New errand..." className="px-input" autoComplete="off" />
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Priority">
          {ORDER.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={priority === p}
              onClick={() => setPriority(p)}
              className={`flex-1 py-2 text-[22px] uppercase leading-none ${
                priority === p ? `${PRIORITY[p].color} text-ink` : "bg-ink text-dim"
              } shadow-[0_-2px_0_0_#0b0820,0_2px_0_0_#0b0820,-2px_0_0_0_#0b0820,2px_0_0_0_#0b0820]`}
            >
              {p}
            </button>
          ))}
        </div>
        <button type="submit" className="px-btn px-btn-ghost w-full">
          + ADD ERRAND
        </button>
      </form>
    </Window>
  );
}
