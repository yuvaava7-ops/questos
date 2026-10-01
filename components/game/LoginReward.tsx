"use client";

import { useTransition } from "react";
import { claimLogin } from "@/lib/game-actions";
import { LOGIN_REWARDS, type LoginState } from "@/lib/login-rewards";
import { sfx } from "@/lib/sfx";
import { Sprite } from "@/components/pixel/Sprite";
import { CHEST, COIN } from "@/components/pixel/sprites";

// Daily login calendar. Shown once per day until claimed.
export function LoginReward({ state, onClose }: { state: LoginState; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div role="dialog" aria-modal="true" aria-label="Daily login reward" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4">
      <div className="anim-pop win w-full max-w-[420px] text-center">
        <p className="logo-shine px-title mt-5 text-[18px]">DAILY REWARD</p>
        <p className="mt-3 text-[24px] text-dim">
          Day {state.cycleDay} of 7 · {state.streak} day{state.streak === 1 ? "" : "s"} in a row
        </p>

        <ul className="mx-4 mt-4 grid grid-cols-4 gap-2">
          {LOGIN_REWARDS.map((xp, i) => {
            const day = i + 1;
            const past = day < state.cycleDay;
            const today = day === state.cycleDay;
            return (
              <li
                key={day}
                className={`flex flex-col items-center gap-1 py-2 ${day === 7 ? "col-span-1" : ""} ${
                  today ? "bg-gold text-ink" : past ? "bg-leaf/70 text-ink" : "bg-ink text-dim"
                } shadow-[0_-2px_0_0_#0b0820,0_2px_0_0_#0b0820,-2px_0_0_0_#0b0820,2px_0_0_0_#0b0820]`}
              >
                <span className="px-title text-[8px]">D{day}</span>
                <Sprite def={day === 7 ? CHEST : COIN} scale={day === 7 ? 2 : 3} />
                <span className="text-[22px] leading-none">{past ? "OK" : `+${xp}`}</span>
              </li>
            );
          })}
        </ul>

        <p className="mx-4 mt-4 text-[21px] leading-tight text-faint">Miss one day and the calendar waits for you. Miss two and it starts over.</p>

        <button
          type="button"
          disabled={isPending}
          className="px-btn mb-5 mt-4"
          onClick={() => {
            sfx.coin();
            startTransition(async () => {
              await claimLogin();
              onClose();
            });
          }}
        >
          Claim +{state.reward} XP
        </button>
      </div>
    </div>
  );
}
