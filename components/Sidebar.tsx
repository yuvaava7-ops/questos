import Image from "next/image";
import { Heart, Calendar, BarChart3, Trophy, BookOpen } from "lucide-react";
import type { UserSummary } from "@/lib/types";
import { xpPercent } from "@/lib/quest-score";
import { BrandMark } from "@/components/BrandMark";
import { ProgressBar } from "@/components/ProgressBar";
import { SignOutButton } from "@/components/SignOutButton";
import { NavLinks } from "@/components/NavLinks";

// Not built yet: listed (not linked) so the roadmap is visible without
// shipping dead "#" links.
const UPCOMING = [
  { label: "Health", icon: Heart },
  { label: "Calendar", icon: Calendar },
  { label: "Analytics", icon: BarChart3 },
  { label: "Achievements", icon: Trophy },
  { label: "Journal", icon: BookOpen },
];

export function Sidebar({ user }: { user: UserSummary }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/50 bg-panel/40 p-4 backdrop-blur-xl md:flex">
      <BrandMark href="/dashboard" className="px-2 pb-8 pt-2" />

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto">
        <NavLinks variant="sidebar" />

        <div className="mb-1.5 mt-7 px-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-text-faint/80">
          Coming soon
        </div>
        {UPCOMING.map(({ label, icon: Icon }) => (
          <span
            key={label}
            aria-disabled="true"
            className="flex cursor-default items-center gap-3 px-3 py-1.5 text-[13px] text-text-faint/70"
          >
            <Icon size={15} strokeWidth={1.75} />
            {label}
          </span>
        ))}
      </nav>

      <div className="tile mt-4 p-3.5">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-gold/60 ring-offset-2 ring-offset-panel2">
              <Image src="/illustrations/portrait.webp" alt="" fill sizes="44px" className="object-cover" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-1 font-mono text-[10px] font-bold text-bg shadow-glow">
              {user.level}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-semibold">{user.name}</div>
            <div className="text-[11.5px] text-gold/90">{user.levelTitle}</div>
          </div>
        </div>
        <div className="mt-3.5">
          <ProgressBar percent={xpPercent(user.xp, user.xpToNextLevel)} label="XP to next level" />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10.5px] text-text-faint">
          <span>
            {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP
          </span>
          <span>Lv {user.level + 1}</span>
        </div>
      </div>
      <SignOutButton />
    </aside>
  );
}
