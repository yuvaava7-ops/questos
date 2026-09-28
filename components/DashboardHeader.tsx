/* eslint-disable @next/next/no-img-element -- small static sprites */
import type { UserSummary } from "@/lib/types";

// Page title plus the player's headline stats on painted orbs.
export function DashboardHeader({ user }: { user: UserSummary }) {
  const stats = [
    { sprite: "/ui/orb-heart.webp", value: user.streakDays, label: "Day streak" },
    { sprite: "/ui/orb-mana.webp", value: user.totalXp.toLocaleString(), label: "Total XP" },
    { sprite: "/ui/star.webp", value: user.level, label: user.levelTitle },
  ];

  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-5 md:mb-8">
      <div>
        <p className="font-display text-[12px] font-bold uppercase tracking-[0.22em] text-text-faint">Your adventure</p>
        {/* Server clock isn't the user's clock, so no time-of-day greeting. */}
        <h1 className="engraved mt-1 font-display text-[28px] font-bold tracking-wide md:text-[34px]">
          Welcome back, <span className="text-gold">{user.name}</span>
        </h1>
      </div>
      <div className="flex gap-2 sm:gap-3">
        {stats.map(({ sprite, value, label }) => (
          <div key={label} className="tile flex items-center gap-2.5 py-1.5 pl-1.5 pr-4">
            <img src={sprite} alt="" className="h-11 w-11 object-contain" />
            <div>
              <div className="engraved font-display text-[18px] font-bold leading-none">{value}</div>
              <div className="mt-1 text-[12px] leading-none text-text-faint">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
