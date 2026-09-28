import { Panel } from "@/components/Panel";
import { adaptSize } from "@/icons/game/adapt-size";
import TrophySvg from "@/icons/game/lorc/trophy.svg";

const Trophy = adaptSize(TrophySvg);

export function RecentAchievements() {
  return (
    <Panel title="Achievements">
      <div className="flex flex-col items-center gap-2 py-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold-dim text-gold">
          <Trophy size={20} aria-hidden />
        </div>
        <p className="text-[13px] text-text-faint">No achievements yet</p>
        <p className="text-[11.5px] text-text-faint">Achievement tracking is coming in a future update.</p>
      </div>
    </Panel>
  );
}
