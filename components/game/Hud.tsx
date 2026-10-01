"use client";

import { useEffect, useState, useTransition } from "react";
import { signOutAction } from "@/lib/auth-actions";
import { isMuted, setMuted, sfx } from "@/lib/sfx";
import type { LevelInfo } from "@/lib/levels";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { SegBar } from "@/components/pixel/SegBar";
import { FLAME, HERO_A } from "@/components/pixel/sprites";

export function Hud({
  name,
  info,
  totalXp,
  streakDays,
}: {
  name: string;
  info: LevelInfo;
  totalXp: number;
  streakDays: number;
}) {
  const [muted, setMutedState] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setMutedState(isMuted()), []);

  return (
    <Window className="mt-4" bodyClassName="p-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0 bg-ink p-1 shadow-[0_-3px_0_0_#ffd24a,0_3px_0_0_#ffd24a,-3px_0_0_0_#ffd24a,3px_0_0_0_#ffd24a]">
          <Sprite def={HERO_A} scale={3} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="px-title truncate text-[11px]">{name}</p>
            <p className="px-title shrink-0 text-[11px] text-gold">LV {info.level}</p>
          </div>
          <p className="truncate text-[20px] uppercase leading-none text-dim">{info.title}</p>
          <div className="mt-2">
            <SegBar fraction={info.fraction} label="Experience to next level" />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[20px] leading-none text-dim">
            <span>
              {info.into}/{info.span} XP
            </span>
            <span className="flex items-center gap-1 text-ember" title="Day streak">
              <Sprite def={FLAME} scale={2} />
              {streakDays}d
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t-2 border-dusk pt-2.5">
        <p className="text-[20px] leading-none text-faint">TOTAL {totalXp} XP</p>
        <div className="flex gap-3">
          <button
            type="button"
            className="px-btn px-btn-ghost !px-3 !py-2.5 !text-[9px]"
            aria-pressed={muted}
            onClick={() => {
              const next = !muted;
              setMuted(next);
              setMutedState(next);
              if (!next) sfx.tap();
            }}
          >
            {muted ? "SND OFF" : "SND ON"}
          </button>
          <form action={() => startTransition(() => signOutAction())}>
            <button type="submit" disabled={isPending} className="px-btn px-btn-ghost !px-3 !py-2.5 !text-[9px]">
              {isPending ? "..." : "EXIT"}
            </button>
          </form>
        </div>
      </div>
    </Window>
  );
}
