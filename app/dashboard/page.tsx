import { Bell, Settings, Flame, Star } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { QuestList } from "@/components/QuestList";
import { SkillProgressPanel } from "@/components/SkillProgressPanel";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { TaskList } from "@/components/TaskList";
import { QuickOverview } from "@/components/QuickOverview";
import { SetupNotice } from "@/components/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProfile, getQuests, getTasks, getSkills, getStatCards, getActivity } from "@/lib/queries";
import type { UserSummary } from "@/lib/types";

// Always render fresh: streak/activity are relative to "today", and data can
// change from outside the app (Supabase Studio, another session).
export const dynamic = "force-dynamic";

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  if (!isSupabaseConfigured) {
    return <SetupNotice />;
  }

  const [profile, quests, tasks, skills, { days, streakDays }] = await Promise.all([
    getProfile(),
    getQuests(),
    getTasks(),
    getSkills(),
    getActivity(),
  ]);
  const stats = await getStatCards(quests);

  const user: UserSummary = {
    name: profile?.name ?? "You",
    level: profile?.level ?? 1,
    levelTitle: profile?.levelTitle ?? "Novice",
    xp: profile?.xp ?? 0,
    xpToNextLevel: profile?.xpToNextLevel ?? 100,
    streakDays,
  };

  return (
    <>
      <Sidebar user={user} />

      <main className="max-w-[1100px] flex-1 px-8 py-10 md:px-12">
        <div className="mb-9 flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">
              {timeOfDayGreeting()}, {user.name}
            </h1>
            <div className="mt-2.5 flex gap-4 text-[13px] text-text-faint">
              <span className="flex items-center gap-1.5">
                <Flame size={14} className="text-orange" /> Streak <span className="font-medium text-text-dim">{user.streakDays} days</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={14} className="text-purple" /> Level <span className="font-medium text-text-dim">{user.level}</span>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-text-faint transition-colors hover:bg-white/[0.05] hover:text-text-dim">
              <Bell size={17} strokeWidth={1.75} />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-text-faint transition-colors hover:bg-white/[0.05] hover:text-text-dim">
              <Settings size={17} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {!profile && (
          <div className="mb-6 rounded-card border border-dashed border-border/60 bg-panel/50 p-4 text-[13px] text-text-dim">
            No profile row found — insert one into <code>profile</code> in Supabase to set your name, level, and XP.
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <QuestList quests={quests} />
          <SkillProgressPanel skills={skills} />
        </div>

        <div className="mb-6">
          <ActivityHeatmap days={days} streakDays={streakDays} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <TaskList tasks={tasks} />
          <QuickOverview user={user} quests={quests} tasks={tasks} />
        </div>
      </main>
    </>
  );
}
