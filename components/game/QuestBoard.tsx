"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { Quest, SkillNodeOption } from "@/lib/types";
import { addQuest, deleteQuest, toggleQuest } from "@/lib/actions";
import { levelFromTotalXp } from "@/lib/leveling";
import { classFor, STAT_KEYS, STATS, emptyStatXp, type StatKey, type StatXp } from "@/lib/stats";
import type { Avatar } from "@/lib/avatar";
import { celebrateAt } from "@/lib/celebrate";
import { sfx } from "@/lib/sfx";
import { CharacterSheet } from "@/components/game/CharacterSheet";
import { Hud } from "@/components/game/Hud";
import { LevelUp, type Fanfare } from "@/components/game/LevelUp";
import { PixelScene } from "@/components/pixel/PixelScene";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { CHECK, CHEST, COIN } from "@/components/pixel/sprites";

const XP_CHOICES = [5, 10, 20, 50];

const STAT_TEXT: Record<string, string> = {
  ruby: "text-ruby",
  sky: "text-sky",
  leaf: "text-leaf",
  grape: "text-grape",
  gold: "text-gold",
};
const STAT_BG: Record<string, string> = {
  ruby: "bg-ruby",
  sky: "bg-sky",
  leaf: "bg-leaf",
  grape: "bg-grape",
  gold: "bg-gold",
};

// The game screen. One column on phones; on desktop it becomes a three-column
// "party screen" (character | journey + quests | errands + skills). Slots are
// server-rendered panels passed in from the page.
export function QuestBoard({
  name,
  quests,
  totalXp,
  statXp,
  avatar,
  streakDays,
  nodeOptions,
  errands,
  skills,
  chronicle,
}: {
  name: string;
  quests: Quest[];
  totalXp: number;
  statXp: StatXp;
  avatar: Avatar | null;
  streakDays: number;
  nodeOptions: SkillNodeOption[];
  errands: React.ReactNode;
  skills: React.ReactNode;
  chronicle: React.ReactNode;
}) {
  const [, startTransition] = useTransition();
  // Optimistic overrides: instant feedback while the server action round-trips.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [xpChoice, setXpChoice] = useState(10);
  const [statChoice, setStatChoice] = useState<StatKey | null>(null);
  const [fanfare, setFanfare] = useState<Fanfare | null>(null);
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

  // Live totals: server values plus the effect of any not-yet-confirmed toggles.
  let delta = 0;
  const liveStat: StatXp = { ...emptyStatXp(), ...statXp };
  for (const q of quests) {
    const o = overrides[q.id];
    if (o === undefined || o === q.done) continue;
    const sign = o ? 1 : -1;
    delta += sign * q.xp;
    if (q.stat) liveStat[q.stat] = Math.max(0, liveStat[q.stat] + sign * q.xp);
  }
  const liveXp = totalXp + delta;
  const info = levelFromTotalXp(liveXp);
  const heroClass = classFor(liveStat);

  const questXp = effective.reduce((s, q) => s + q.xp, 0);
  const earnedXp = effective.filter((q) => q.done).reduce((s, q) => s + q.xp, 0);
  const progress = questXp > 0 ? earnedXp / questXp : 0;
  const doneCount = effective.filter((q) => q.done).length;
  const nextQuest = effective.find((q) => !q.done);
  const allDone = effective.length > 0 && !nextQuest;

  const seenLevel = useRef(info.level);
  const seenClass = useRef(heroClass.name);
  useEffect(() => {
    if (info.level > seenLevel.current) {
      sfx.levelUp();
      setFanfare({ headline: "LEVEL UP!", big: `LV ${info.level}`, sub: info.levelTitle });
    } else if (heroClass.name !== seenClass.current && heroClass.primary) {
      sfx.levelUp();
      setFanfare({ headline: "NEW CLASS!", big: heroClass.name, sub: heroClass.blurb });
    }
    seenLevel.current = info.level;
    seenClass.current = heroClass.name;
  }, [info.level, info.levelTitle, heroClass.name, heroClass.blurb, heroClass.primary]);
  const closeFanfare = useCallback(() => setFanfare(null), []);

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
    <div className="flex flex-col lg:grid lg:grid-cols-[340px_minmax(0,1fr)_340px] lg:items-start lg:gap-x-8">
      {/* left: who you are */}
      <div className="contents lg:flex lg:flex-col">
        <div className="order-1">
          <Hud name={name} info={info} heroClass={heroClass} avatar={avatar} totalXp={liveXp} streakDays={streakDays} />
        </div>
        <div className="order-4">
          <CharacterSheet heroClass={heroClass} statXp={liveStat} avatar={avatar} />
        </div>
      </div>

      {/* centre: the day */}
      <div className="contents lg:flex lg:flex-col">
        <div className="order-2">
          <Window title="Today's Journey" className="mt-7 lg:mt-4" bodyClassName="pt-3 pb-0 px-0">
            <PixelScene mode="journey" progress={progress} heroStat={heroClass.primary} avatar={avatar} />
            <p className="bg-ink/60 px-4 py-2.5 text-center text-[22px] leading-tight text-paper lg:text-[26px]">
              {effective.length === 0
                ? "Add a quest to begin the journey."
                : allDone
                  ? "All quests clear! The castle is yours."
                  : `${doneCount}/${effective.length} done — next: ${nextQuest?.label}`}
            </p>
          </Window>
        </div>

        <div className="order-3">
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
                    {q.stat && (
                      <span className={`px-title shrink-0 text-[8px] ${STAT_TEXT[STATS[q.stat].color]}`}>{STATS[q.stat].abbr}</span>
                    )}
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
                if (statChoice) formData.set("stat", statChoice);
                startTransition(async () => {
                  await addQuest(formData);
                  formRef.current?.reset();
                });
              }}
              className="mt-4 flex flex-col gap-3 border-t-2 border-dusk pt-4"
            >
              <input name="label" required maxLength={120} placeholder="New quest..." className="px-input" autoComplete="off" />

              <div className="flex gap-1.5" role="radiogroup" aria-label="Stat this quest trains (optional)">
                {STAT_KEYS.map((k) => {
                  const on = statChoice === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      title={`${STATS[k].name}: ${STATS[k].blurb}`}
                      onClick={() => setStatChoice(on ? null : k)}
                      className={`px-title flex-1 py-2.5 text-[9px] ${
                        on ? `${STAT_BG[STATS[k].color]} text-ink` : `bg-ink ${STAT_TEXT[STATS[k].color]}`
                      } shadow-[0_-2px_0_0_#0b0820,0_2px_0_0_#0b0820,-2px_0_0_0_#0b0820,2px_0_0_0_#0b0820]`}
                    >
                      {STATS[k].abbr}
                    </button>
                  );
                })}
              </div>

              {nodeOptions.length > 0 && (
                <select name="skill_node_id" aria-label="Train a skill (optional)" defaultValue="" className="px-input">
                  <option value="">No skill link</option>
                  {nodeOptions.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.treeName}: {n.name}
                    </option>
                  ))}
                </select>
              )}
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
        </div>

        <div className="order-7">{chronicle}</div>
      </div>

      {/* right: everything else */}
      <div className="contents lg:flex lg:flex-col">
        <div className="order-5 lg:-mt-3">{errands}</div>
        <div className="order-6">{skills}</div>
      </div>

      {fanfare && <LevelUp fanfare={fanfare} onClose={closeFanfare} />}
    </div>
  );
}
