import type { UserSummary } from "@/lib/types";
import { xpPercent } from "@/lib/quest-score";
import { BrandMark } from "@/components/BrandMark";
import { ProgressBar } from "@/components/ProgressBar";
import { SignOutButton } from "@/components/SignOutButton";
import { NavLinks } from "@/components/NavLinks";

// Below md the Sidebar is hidden; this keeps navigation, level/XP and
// sign-out reachable.
export function MobileTopBar({ user }: { user: UserSummary }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-bg/85 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3">
        <BrandMark href="/dashboard" />
        <div className="flex items-center gap-2">
          <NavLinks variant="compact" />
          <div className="w-16">
            <div className="mb-1 text-right text-[10.5px] text-text-faint">Lv {user.level}</div>
            <ProgressBar percent={xpPercent(user.xp, user.xpToNextLevel)} label="XP to next level" />
          </div>
          <SignOutButton compact />
        </div>
      </div>
    </header>
  );
}
