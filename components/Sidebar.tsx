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
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border p-4 md:flex">
      <div className="flex items-center gap-2.5 px-2 pb-7 pt-1 text-lg font-extrabold">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue to-purple">
          <Zap size={15} />
        </div>
        QuestOS
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
                : "text-text-dim hover:bg-panel2 hover:text-text"
            }`}
          >
            <Icon size={16} />
            {label}
          </a>
        ))}
      </nav>

      <div className="border-t border-border pt-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-purple to-blue text-sm font-bold">
            {user.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">{user.name}</div>
            <div className="text-[11px] text-text-dim">Level {user.level}</div>
          </div>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[#1c2233]">
          <div className="h-full bg-gradient-to-r from-blue to-purple" style={{ width: `${xpPercent}%` }} />
        </div>
        <div className="mt-1 text-[10.5px] text-text-faint">
          {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
