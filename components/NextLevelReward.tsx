import Image from "next/image";
import { SectionHeading } from "@/components/SectionHeading";
import type { UserSummary } from "@/lib/types";

export function NextLevelReward({ user }: { user: UserSummary }) {
  const percent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));
  const remaining = Math.max(0, user.xpToNextLevel - user.xp);

  return (
    <div className="rounded-card border border-border/60 bg-panel p-6">
      <SectionHeading title="Next Level" />
      <div className="flex flex-col items-center text-center">
        <div className="relative h-32 w-32">
          <Image src="/illustrations/chest.webp" alt="" fill className="object-contain" />
        </div>
        <div className="-mt-2 font-display text-[16px] font-semibold tracking-wide">Level {user.level + 1}</div>
        <div className="mt-3 w-full">
          <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-1.5 text-[11px] text-text-faint">
            {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP · {remaining.toLocaleString()} to go
          </div>
        </div>
        <p className="mt-3 text-[11.5px] text-text-faint">Level-up rewards are coming in a future update.</p>
      </div>
    </div>
  );
}
