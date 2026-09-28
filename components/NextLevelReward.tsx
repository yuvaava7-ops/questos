/* eslint-disable @next/next/no-img-element -- small static sprite */
import Image from "next/image";
import { Panel } from "@/components/Panel";
import { ProgressBar } from "@/components/ProgressBar";
import { xpPercent } from "@/lib/quest-score";
import type { UserSummary } from "@/lib/types";

export function NextLevelReward({ user }: { user: UserSummary }) {
  const remaining = Math.max(0, user.xpToNextLevel - user.xp);

  return (
    <Panel title="Next Level">
      <div className="flex flex-col items-center text-center">
        <div className="relative h-28 w-28">
          <Image src="/illustrations/chest.webp" alt="" fill sizes="112px" className="object-contain drop-shadow-[0_8px_12px_rgb(0_0_0/0.7)]" />
        </div>
        <div className="relative -mt-2 flex h-14 w-[230px] items-center justify-center">
          <img src="/ui/ribbon.webp" alt="" className="absolute inset-0 h-full w-full object-contain" />
          <span className="engraved relative -mt-2 font-display text-[16px] font-bold tracking-wide text-[#fff4e0]">
            Level {user.level + 1}
          </span>
        </div>
        <div className="mt-2 w-full">
          <ProgressBar percent={xpPercent(user.xp, user.xpToNextLevel)} label="XP to next level" />
          <div className="mt-1.5 flex justify-between font-display text-[12px] text-text-faint">
            <span>
              {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP
            </span>
            <span className="text-gold">{remaining.toLocaleString()} to go</span>
          </div>
        </div>
        <p className="mt-3 text-[13px] text-text-faint">Level-up rewards are coming in a future update.</p>
      </div>
    </Panel>
  );
}
