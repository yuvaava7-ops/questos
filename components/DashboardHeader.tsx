import { Flame, Star, Zap } from "lucide-react";
import type { UserSummary } from "@/lib/types";

// Page title plus the player's headline stats as chips.
export function DashboardHeader({ user }: { user: UserSummary }) {
  const chips = [
    {
      icon: Flame,
      label: `${user.streakDays}-day streak`,
      className: "border-orange/30 bg-orange-dim/60 text-orange",
    },
    { icon: Star, label: `Level ${user.level} · ${user.levelTitle}`, className: "border-purple/30 bg-purple-dim/60 text-purple" },
    { icon: Zap, label: `${user.totalXp.toLocaleString()} XP`, className: "border-gold/30 bg-gold-dim/60 text-gold" },
  ];

  return (
    <header className="mb-7 animate-fade-up md:mb-9">
      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-text-faint">Your adventure</p>
      {/* Server clock isn't the user's clock, so no time-of-day greeting. */}
      <h1 className="mt-1.5 font-display text-[26px] font-semibold tracking-wide md:text-[32px]">
        Welcome back,{" "}
        <span className="bg-gradient-to-r from-gold-bright to-gold bg-clip-text text-transparent">{user.name}</span>
      </h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map(({ icon: Icon, label, className }) => (
          <span key={label} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-medium ${className}`}>
            <Icon size={13} strokeWidth={2.25} />
            {label}
          </span>
        ))}
      </div>
    </header>
  );
}
