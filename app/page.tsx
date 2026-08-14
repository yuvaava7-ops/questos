import { Bell, Home as HomeIcon, Flame, Star } from "lucide-react";
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

      <main className="max-w-[1100px] flex-1 px-6 py-8 md:px-10">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight">Good morning, {user.name}</h1>
            <div className="mt-2 flex gap-3.5 text-[13px] font-medium text-text-dim">
              <span className="flex items-center gap-1.5">
                <Flame size={14} className="text-orange" /> Streak: <strong className="text-text">{user.streakDays} days</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={14} className="text-purple" /> Level: <strong className="text-text">{user.level}</strong>
              </span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-panel2 text-text-dim">
              <Bell size={16} />
            </button>
            <button className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-panel2 text-text-dim">
              <HomeIcon size={16} />
            </button>
          </div>
        </div>

        {!profile && (
          <div className="mb-5 rounded-card border border-dashed border-border bg-panel/50 p-4 text-[13px] text-text-dim">
            No profile row found — insert one into <code>profile</code> in Supabase to set your name, level, and XP.
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div className="mb-3.5 grid gap-3.5 lg:grid-cols-2">
          <QuestList quests={quests} />
          <SkillProgressPanel skills={skills} />
        </div>

        <ActivityHeatmap days={days} streakDays={streakDays} />

        <div className="grid gap-3.5 lg:grid-cols-2">
          <TaskList tasks={tasks} />
          <QuickOverview user={user} quests={quests} tasks={tasks} />
        </div>
      </main>
    </>
  );
}
