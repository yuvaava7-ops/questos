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
        <div className="relative h-32 w-32">
          <div aria-hidden className="absolute inset-4 rounded-full bg-gold/25 blur-2xl" />
          <Image src="/illustrations/chest.webp" alt="" fill sizes="128px" className="relative object-contain drop-shadow-[0_8px_16px_rgb(0_0_0/0.6)]" />
        </div>
        <div className="-mt-1 font-display text-[18px] font-semibold tracking-wide">
          Level <span className="bg-gradient-to-b from-gold-bright to-gold bg-clip-text text-transparent">{user.level + 1}</span>
        </div>
        <div className="mt-3 w-full">
          <ProgressBar percent={xpPercent(user.xp, user.xpToNextLevel)} label="XP to next level" />
          <div className="mt-2 flex justify-between font-mono text-[11px] text-text-faint">
            <span>
              {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP
            </span>
            <span className="text-gold">{remaining.toLocaleString()} to go</span>
          </div>
        </div>
        <p className="mt-3 text-[11.5px] text-text-faint">Level-up rewards are coming in a future update.</p>
      </div>
    </Panel>
  );
}
