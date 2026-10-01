"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { Quest } from "@/lib/types";
import { addQuest, deleteQuest, toggleQuest } from "@/lib/actions";
import { levelFromXp } from "@/lib/levels";
import { celebrateAt } from "@/lib/celebrate";
import { sfx } from "@/lib/sfx";
import { Hud } from "@/components/game/Hud";
import { LevelUp } from "@/components/game/LevelUp";
import { PixelScene } from "@/components/pixel/PixelScene";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { CHECK, CHEST, COIN } from "@/components/pixel/sprites";

const XP_CHOICES = [5, 10, 20, 50];

export function QuestBoard({
  name,
  quests,
  totalXp,
  streakDays,
}: {
  name: string;
  quests: Quest[];
  totalXp: number;
  streakDays: number;
}) {
  const [, startTransition] = useTransition();
  // Optimistic overrides: instant feedback while the server action round-trips.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [xpChoice, setXpChoice] = useState(10);
  const [levelUp, setLevelUp] = useState<{ level: number; title: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Once fresh server data arrives, drop overrides it already agrees with.
  useEffect(() => {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const q of quests) if (next[q.id] === q.done) delete next[q.id];
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [quests]);

  const effective = quests.map((q) => ({ ...q, done: overrides[q.id] ?? q.done }));
  const delta = quests.reduce((sum, q) => {
    const o = overrides[q.id];
    return o === undefined || o === q.done ? sum : sum + (o ? q.xp : -q.xp);
  }, 0);
  const liveXp = totalXp + delta;
  const info = levelFromXp(liveXp);

  const questXp = effective.reduce((s, q) => s + q.xp, 0);
  const earnedXp = effective.filter((q) => q.done).reduce((s, q) => s + q.xp, 0);
  const progress = questXp > 0 ? earnedXp / questXp : 0;
  const doneCount = effective.filter((q) => q.done).length;
  const nextQuest = effective.find((q) => !q.done);
  const allDone = effective.length > 0 && !nextQuest;

  const seenLevel = useRef(info.level);
  useEffect(() => {
    if (info.level > seenLevel.current) {
      sfx.levelUp();
      setLevelUp({ level: info.level, title: info.title });
    }
    seenLevel.current = info.level;
  }, [info.level, info.title]);
  const closeLevelUp = useCallback(() => setLevelUp(null), []);

  function toggle(q: Quest & { done: boolean }, el: HTMLElement) {
    const next = !q.done;
    setOverrides((o) => ({ ...o, [q.id]: next }));
    if (next) {
      celebrateAt(el, q.xp);
      sfx.coin();
    } else {
      sfx.undo();
    }
    startTransition(async () => {
      try {
        await toggleQuest(q.id, next);
      } catch {
        setOverrides((o) => {
          const { [q.id]: _drop, ...rest } = o;
          return rest;
        });
      }
    });
  }

  return (
    <>
      <Hud name={name} info={info} totalXp={liveXp} streakDays={streakDays} />

      <Window title="Today's Journey" className="mt-7" bodyClassName="pt-3 pb-0 px-0">
        <PixelScene mode="journey" progress={progress} />
        <p className="bg-ink/60 px-4 py-2.5 text-center text-[22px] leading-tight text-paper">
          {effective.length === 0
            ? "Add a quest to begin the journey."
            : allDone
              ? "All quests clear! The castle is yours."
              : `${doneCount}/${effective.length} done — next: ${nextQuest?.label}`}
        </p>
      </Window>

      <Window title="Quest Log" right={effective.length > 0 ? `${doneCount}/${effective.length}` : undefined} className="mt-7">
        {effective.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-3 text-center">
            <Sprite def={CHEST} scale={5} />
            <p className="text-[24px] text-dim">The log is empty. Add your first quest below.</p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {effective.map((q) => (
              <li key={q.id} className="flex min-h-[48px] items-center gap-3 border-b-2 border-dusk/70 last:border-b-0">
                <button
                  type="button"
                  onClick={(e) => toggle(q, e.currentTarget)}
                  aria-pressed={q.done}
                  aria-label={`Mark "${q.label}" as ${q.done ? "not done" : "done"}`}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center shadow-[0_-3px_0_0_#f4f1ff,0_3px_0_0_#f4f1ff,-3px_0_0_0_#f4f1ff,3px_0_0_0_#f4f1ff] ${
                    q.done ? "bg-leaf" : "bg-ink"
                  }`}
                >
                  {q.done && <Sprite def={CHECK} scale={3} />}
                </button>
                <span className={`min-w-0 flex-1 break-words text-[24px] leading-tight ${q.done ? "text-faint line-through" : "text-paper"}`}>
                  {q.label}
                  {q.time && <span className="ml-2 text-[20px] text-faint">{q.time}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[22px] text-gold">
                  <Sprite def={COIN} scale={2} />
                  {q.xp}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sfx.undo();
                    startTransition(() => deleteQuest(q.id));
                  }}
                  aria-label={`Delete "${q.label}"`}
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
            formData.set("xp", String(xpChoice));
            startTransition(async () => {
              await addQuest(formData);
              formRef.current?.reset();
            });
          }}
          className="mt-4 flex flex-col gap-3 border-t-2 border-dusk pt-4"
        >
          <input name="label" required maxLength={120} placeholder="New quest..." className="px-input" autoComplete="off" />
          <div className="flex items-center gap-2">
            <input name="time" maxLength={12} placeholder="7:00" aria-label="Time (optional)" className="px-input !w-[88px] shrink-0" />
            <div className="flex flex-1 gap-1.5" role="radiogroup" aria-label="XP reward">
              {XP_CHOICES.map((xp) => (
                <button
                  key={xp}
                  type="button"
                  role="radio"
                  aria-checked={xpChoice === xp}
                  onClick={() => setXpChoice(xp)}
                  className={`flex-1 py-2 text-[22px] leading-none ${
                    xpChoice === xp ? "bg-gold text-ink" : "bg-ink text-dim"
                  } shadow-[0_-2px_0_0_#0b0820,0_2px_0_0_#0b0820,-2px_0_0_0_#0b0820,2px_0_0_0_#0b0820]`}
                >
                  {xp}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="px-btn w-full">
            + ADD QUEST
          </button>
        </form>
      </Window>

      {levelUp && <LevelUp level={levelUp.level} title={levelUp.title} onClose={closeLevelUp} />}
    </>
  );
}
