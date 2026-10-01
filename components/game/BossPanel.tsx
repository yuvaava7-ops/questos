"use client";

import { useState, useTransition } from "react";
import { claimBoss, summonBoss } from "@/lib/game-actions";
import { BOSS_PRESETS, bossLook, type BossLook, type BossState } from "@/lib/boss";
import { sfx } from "@/lib/sfx";
import { SegBar } from "@/components/pixel/SegBar";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { EYE, SKULL, SLIME } from "@/components/pixel/sprites";

const LOOK = { slime: SLIME, skull: SKULL, eye: EYE } satisfies Record<BossLook, unknown>;

// The week's boss: every XP you earn damages it; defeat it for a bonus.
export function BossPanel({ boss, liveDamage }: { boss: BossState | null; liveDamage: number }) {
  const [isPending, startTransition] = useTransition();
  const [hp, setHp] = useState<number>(BOSS_PRESETS[1].hp);
  const [error, setError] = useState<string | null>(null);

  if (!boss) {
    return (
      <Window title="Weekly Boss" className="mt-7">
        <p className="mb-3 text-[23px] leading-tight text-dim">
          Summon a boss for this week. All the XP you earn hurts it. Beat it before Sunday for a bonus.
        </p>
        <form
          action={(formData) => {
            sfx.tap();
            formData.set("hp", String(hp));
            setError(null);
            startTransition(async () => {
              const result = await summonBoss(formData);
              if (result.error) setError(result.error);
            });
          }}
          className="flex flex-col gap-3"
        >
          <input name="name" required maxLength={60} placeholder="Boss name, e.g. IELTS Mock Exam" className="px-input" autoComplete="off" />
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Difficulty">
            {BOSS_PRESETS.map((p) => (
              <button
                key={p.hp}
                type="button"
                role="radio"
                aria-checked={hp === p.hp}
                onClick={() => setHp(p.hp)}
                className={`py-2 text-[22px] leading-none ${hp === p.hp ? "bg-ruby text-ink" : "bg-ink text-dim"} shadow-[0_-2px_0_0_#0b0820,0_2px_0_0_#0b0820,-2px_0_0_0_#0b0820,2px_0_0_0_#0b0820]`}
              >
                {p.label} · {p.hp} HP
              </button>
            ))}
          </div>
          {error && (
            <p role="alert" className="text-[22px] text-ruby">
              ! {error}
            </p>
          )}
          <button type="submit" disabled={isPending} className="px-btn w-full">
            Summon boss
          </button>
        </form>
      </Window>
    );
  }

  const damage = Math.min(boss.hp, liveDamage);
  const beaten = boss.defeated || liveDamage >= boss.hp;
  const left = Math.max(0, boss.hp - damage);

  return (
    <Window title="Weekly Boss" right={beaten ? "defeated" : `${boss.daysLeft}d left`} className="mt-7">
      <div className="flex items-center gap-4">
        <div className={`shrink-0 ${beaten ? "opacity-40 grayscale" : "anim-bob"}`}>
          <Sprite def={LOOK[bossLook(boss.hp)]} scale={4} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="px-title break-words text-[11px] leading-snug">{boss.name}</p>
          <div className="mt-2">
            <SegBar fraction={left / boss.hp} color="ruby" segments={16} label="Boss health" />
          </div>
          <p className="mt-1.5 text-[21px] leading-none text-dim">
            {left} / {boss.hp} HP
          </p>
        </div>
      </div>

      {beaten && !boss.claimed && (
        <button
          type="button"
          disabled={isPending}
          className="px-btn mt-4 w-full"
          onClick={() => {
            sfx.levelUp();
            startTransition(() => claimBoss());
          }}
        >
          Claim +{boss.rewardXp} XP
        </button>
      )}
      {beaten && boss.claimed && <p className="mt-3 text-[23px] text-leaf">Victory! Reward claimed. A new boss arrives Monday.</p>}
      {!beaten && <p className="mt-3 text-[21px] leading-tight text-faint">Defeat it for +{boss.rewardXp} XP. Every quest you finish deals damage.</p>}
    </Window>
  );
}
