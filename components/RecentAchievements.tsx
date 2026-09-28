/* eslint-disable @next/next/no-img-element -- small static sprite */
import { Panel } from "@/components/Panel";

export function RecentAchievements() {
  return (
    <Panel title="Achievements">
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <img src="/ui/star.webp" alt="" className="h-12 w-12 opacity-40 grayscale" />
        <p className="font-display text-[14px] font-semibold text-text-dim">No achievements yet</p>
        <p className="text-[13px] text-text-faint">Achievement tracking is coming in a future update.</p>
      </div>
    </Panel>
  );
}
