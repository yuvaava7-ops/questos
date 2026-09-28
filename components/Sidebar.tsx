/* eslint-disable @next/next/no-img-element -- small static sprite */
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
    <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 p-3 md:block">
      <div className="frame flex h-full flex-col px-2 py-2">
        <BrandMark href="/dashboard" className="px-1 pb-6 pt-1" />

        <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto">
          <NavLinks variant="sidebar" />

          <div className="mb-1.5 mt-6 border-b border-gold/20 px-1 pb-1.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-text-faint">
            Coming soon
          </div>
          {UPCOMING.map(({ label, icon: Icon }) => (
            <span key={label} aria-disabled="true" className="flex cursor-default items-center gap-3 px-3 py-1.5 text-[14px] text-text-faint/80">
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </span>
          ))}
        </nav>

        <div className="tile mt-3 p-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#8a8c90] shadow-[0_0_0_1px_rgb(0_0_0/0.8),inset_0_0_6px_rgb(0_0_0/0.8)]">
                <Image src="/illustrations/portrait.webp" alt="" fill sizes="48px" className="object-cover" />
              </div>
              <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center">
                <img src="/ui/star.webp" alt="" className="absolute inset-0 h-full w-full" />
                <span className="relative pt-0.5 font-display text-[11px] font-bold text-[#3a2206]">{user.level}</span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-[14px] font-bold">{user.name}</div>
              <div className="text-[12.5px] text-gold">{user.levelTitle}</div>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar percent={xpPercent(user.xp, user.xpToNextLevel)} label="XP to next level" size="sm" />
          </div>
          <div className="mt-1.5 flex justify-between font-display text-[11px] text-text-faint">
            <span>
              {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP
            </span>
            <span>Lv {user.level + 1}</span>
          </div>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
