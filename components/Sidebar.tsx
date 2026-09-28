import Image from "next/image";
import { Home, Heart, TreeDeciduous, Calendar, BarChart3, Trophy, BookOpen, Settings } from "lucide-react";
import type { UserSummary } from "@/lib/types";
import { xpPercent } from "@/lib/quest-score";
import { BrandMark } from "@/components/BrandMark";
import { ProgressBar } from "@/components/ProgressBar";
import { SignOutButton } from "@/components/SignOutButton";

// Only the dashboard exists today. The rest are listed (not linked) so the
// roadmap is visible without shipping dead "#" links.
const UPCOMING = [
  { label: "Skill Trees", icon: TreeDeciduous },
  { label: "Health", icon: Heart },
  { label: "Calendar", icon: Calendar },
  { label: "Analytics", icon: BarChart3 },
  { label: "Achievements", icon: Trophy },
  { label: "Journal", icon: BookOpen },
  { label: "Settings", icon: Settings },
];

export function Sidebar({ user }: { user: UserSummary }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-bg/40 p-5 md:flex">
      <BrandMark href="/dashboard" className="px-1 pb-9 pt-1" />

      <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        <a
          href="/dashboard"
          aria-current="page"
          className="flex items-center gap-3 rounded-[6px] border-l-2 border-gold bg-white/[0.05] px-3 py-2 text-[13.5px] font-medium text-text"
        >
          <Home size={16} strokeWidth={1.75} />
          Dashboard
        </a>

        <div className="mb-1 mt-6 px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-text-faint/70">
          Coming soon
        </div>
        {UPCOMING.map(({ label, icon: Icon }) => (
          <span
            key={label}
            aria-disabled="true"
            className="flex cursor-default items-center gap-3 border-l-2 border-transparent px-3 py-1.5 text-[13px] text-text-faint/60"
          >
            <Icon size={15} strokeWidth={1.75} />
            {label}
          </span>
        ))}
      </nav>

      <div className="border-t border-border/60 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gold/30">
            <Image src="/illustrations/portrait.webp" alt="" fill sizes="36px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{user.name}</div>
            <div className="text-[11px] text-text-faint">
              Level {user.level} · {user.levelTitle}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar percent={xpPercent(user.xp, user.xpToNextLevel)} label="XP to next level" />
        </div>
        <div className="mt-1.5 text-[10.5px] text-text-faint">
          {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
