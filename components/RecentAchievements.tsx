import { Panel } from "@/components/Panel";
import { adaptSize } from "@/icons/game/adapt-size";
import TrophySvg from "@/icons/game/lorc/trophy.svg";

const Trophy = adaptSize(TrophySvg);

export function RecentAchievements() {
  return (
    <Panel title="Achievements">
      <div className="flex flex-col items-center gap-2 py-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-b from-gold/20 to-gold-dim text-gold shadow-[0_0_24px_-6px_rgb(var(--gold)/0.6)]">
          <Trophy size={24} aria-hidden />
        </div>
        <p className="text-[13.5px] font-medium text-text-dim">No achievements yet</p>
        <p className="text-[11.5px] text-text-faint">Achievement tracking is coming in a future update.</p>
      </div>
    </Panel>
  );
}
