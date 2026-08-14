import { SectionHeading } from "@/components/SectionHeading";
import { adaptSize } from "@/icons/game/adapt-size";
import TrophySvg from "@/icons/game/lorc/trophy.svg";

const Trophy = adaptSize(TrophySvg);

export function RecentAchievements() {
  return (
    <div className="rounded-card border border-border/60 bg-panel p-6">
      <SectionHeading title="Recent Achievements" />
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <Trophy size={22} className="text-text-faint" />
        <p className="text-[13px] text-text-faint">No achievements yet</p>
        <p className="text-[11.5px] text-text-faint">Achievement tracking is coming in a future update.</p>
      </div>
    </div>
  );
}
