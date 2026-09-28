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
          <Image src="/illustrations/chest.webp" alt="" fill sizes="128px" className="object-contain" />
        </div>
        <div className="-mt-2 font-display text-[16px] font-semibold tracking-wide">Level {user.level + 1}</div>
        <div className="mt-3 w-full">
          <ProgressBar percent={xpPercent(user.xp, user.xpToNextLevel)} label="XP to next level" />
          <div className="mt-1.5 text-[11px] text-text-faint">
            {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP · {remaining.toLocaleString()} to go
          </div>
        </div>
        <p className="mt-3 text-[11.5px] text-text-faint">Level-up rewards are coming in a future update.</p>
      </div>
    </Panel>
  );
}
