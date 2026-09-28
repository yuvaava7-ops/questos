import { Flame, Star } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { MobileTopBar } from "@/components/MobileTopBar";
import { StatCard } from "@/components/StatCard";
import { QuestScoreHero } from "@/components/QuestScoreHero";
import { QuestList } from "@/components/QuestList";
import { SkillProgressPanel } from "@/components/SkillProgressPanel";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { TaskList } from "@/components/TaskList";
import { QuickActions } from "@/components/QuickActions";
import { QuickOverview } from "@/components/QuickOverview";
import { HealthOverview } from "@/components/HealthOverview";
import { RecentAchievements } from "@/components/RecentAchievements";
import { NextLevelReward } from "@/components/NextLevelReward";
import { SetupNotice } from "@/components/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProfile, getQuests, getTasks, getSkills, getStatCards, getActivity } from "@/lib/queries";
import { yesterdayISO } from "@/lib/dates";
import { questScore, questScoreTrend } from "@/lib/quest-score";
import type { UserSummary } from "@/lib/types";

// Always render fresh: streak/activity are relative to "today", and data can
// change from outside the app (Supabase Studio, another session).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured) {
    return <SetupNotice />;
  }

  // One parallel round of queries; everything else is derived in-process.
  const [profile, quests, yesterdayQuests, tasks, skills, stats, { days, streakDays }] = await Promise.all([
    getProfile(),
    getQuests(),
    getQuests(yesterdayISO()),
    getTasks(),
    getSkills(),
    getStatCards(),
    getActivity(),
  ]);

  const user: UserSummary = {
    name: profile?.name ?? "You",
    level: profile?.level ?? 1,
    levelTitle: profile?.levelTitle ?? "Novice",
    xp: profile?.xp ?? 0,
    xpToNextLevel: profile?.xpToNextLevel ?? 100,
    streakDays,
  };

  const mainQuest = quests.find((q) => !q.done) ?? null;
  const allQuestsDone = quests.length > 0 && mainQuest === null;

  return (
    <div className="flex w-full flex-1 flex-col md:flex-row">
      <Sidebar user={user} />
      <MobileTopBar user={user} />

      <main className="w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10">
        {/* Server clock isn't the user's clock, so no time-of-day greeting. */}
        <header className="mb-7 md:mb-9">
          <h1 className="font-display text-[22px] font-semibold tracking-wide md:text-[26px]">
            Welcome back, {user.name}
          </h1>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-text-faint">
            <span className="flex items-center gap-1.5">
              <Flame size={14} className="text-orange" /> Streak{" "}
              <span className="font-medium text-text-dim">
                {user.streakDays} {user.streakDays === 1 ? "day" : "days"}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={14} className="text-purple" /> Level <span className="font-medium text-text-dim">{user.level}</span>
              <span className="text-text-faint">· {user.levelTitle}</span>
            </span>
          </div>
        </header>

        {!profile && (
          <div className="mb-6 rounded-card border border-dashed border-border/60 bg-panel/50 p-4 text-[13px] text-text-dim">
            No profile row found. Insert one into <code>profile</code> in Supabase to set your name, level, and XP.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-4">
            <QuestScoreHero
              score={questScore(quests)}
              trend={questScoreTrend(quests, yesterdayQuests)}
              mainQuest={mainQuest}
              allDone={allQuestsDone}
            />

            {stats.length > 0 && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {stats.map((stat) => (
                  <StatCard key={stat.id} stat={stat} />
                ))}
              </div>
            )}

            <QuestList quests={quests} />
            <SkillProgressPanel skills={skills} />
            <ActivityHeatmap days={days} streakDays={streakDays} />
            <TaskList tasks={tasks} />
          </div>

          {/* Live data first; "coming soon" placeholders last. */}
          <div className="flex min-w-0 flex-col gap-4">
            <QuickActions />
            <NextLevelReward user={user} />
            <QuickOverview user={user} quests={quests} tasks={tasks} />
            <RecentAchievements />
            <HealthOverview />
          </div>
        </div>
      </main>
    </div>
  );
}
