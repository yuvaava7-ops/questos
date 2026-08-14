import {
  Home,
  Heart,
  TreeDeciduous,
  CheckSquare,
  Calendar,
  BarChart3,
  Trophy,
  BookOpen,
  Settings,
  Zap,
} from "lucide-react";
import type { UserSummary } from "@/lib/types";
import { SignOutButton } from "@/components/SignOutButton";

const NAV_ITEMS = [
  { label: "Home", icon: Home, active: true },
  { label: "Health", icon: Heart },
  { label: "Skills", icon: TreeDeciduous },
  { label: "Tasks", icon: CheckSquare },
  { label: "Calendar", icon: Calendar },
  { label: "Analytics", icon: BarChart3 },
  { label: "Achievements", icon: Trophy },
  { label: "Journal", icon: BookOpen },
  { label: "Settings", icon: Settings },
];

export function Sidebar({ user }: { user: UserSummary }) {
  const xpPercent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 p-5 md:flex">
      <div className="flex items-center gap-2.5 px-1 pb-9 pt-1 font-display text-[15px] font-semibold tracking-wide">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold text-bg">
          <Zap size={14} />
        </div>
        QuestOS
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 rounded-[6px] border-l-2 px-3 py-2 text-[13.5px] font-medium transition-colors ${
              active
                ? "border-gold bg-white/[0.05] text-text"
                : "border-transparent text-text-faint hover:bg-white/[0.03] hover:text-text-dim"
            }`}
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </a>
        ))}
      </nav>

      <div className="border-t border-border/60 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel2 text-[13px] font-semibold text-text-dim">
            {user.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{user.name}</div>
            <div className="text-[11px] text-text-faint">Level {user.level}</div>
          </div>
        </div>
        <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-gold" style={{ width: `${xpPercent}%` }} />
        </div>
        <div className="mt-1.5 text-[10.5px] text-text-faint">
          {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
