import { Flame, Star } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { QuestScoreHero } from "@/components/QuestScoreHero";
import { QuestList } from "@/components/QuestList";
import { SkillTreesPanel } from "@/components/skills/SkillTreesPanel";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { TaskList } from "@/components/TaskList";
import { QuickActions } from "@/components/QuickActions";
import { QuickOverview } from "@/components/QuickOverview";
import { HealthOverview } from "@/components/HealthOverview";
import { RecentAchievements } from "@/components/RecentAchievements";
import { NextLevelReward } from "@/components/NextLevelReward";
import {
  getUserSummary,
  getQuests,
  getTasks,
  getStatCards,
  getActivity,
  getXpProgress,
  getTrees,
  getNodeOptions,
} from "@/lib/queries";
import { yesterdayISO } from "@/lib/dates";
import { questScore, questScoreTrend } from "@/lib/quest-score";

export default async function DashboardPage() {
  // One parallel round of queries; everything else is derived in-process.
  // getUserSummary/getActivity/getXpProgress are request-cached, so the
  // layout's calls are reused here, not repeated.
  const xp = await getXpProgress();
  const [user, quests, yesterdayQuests, tasks, stats, { days, streakDays }, trees, nodeOptions] = await Promise.all([
    getUserSummary(),
    getQuests(),
    getQuests(yesterdayISO()),
    getTasks(),
    getStatCards(),
    getActivity(),
    getTrees(xp),
    getNodeOptions(),
  ]);

  const mainQuest = quests.find((q) => !q.done) ?? null;
  const allQuestsDone = quests.length > 0 && mainQuest === null;

  return (
    <>
      {/* Server clock isn't the user's clock, so no time-of-day greeting. */}
      <header className="mb-7 md:mb-9">
        <h1 className="font-display text-[22px] font-semibold tracking-wide md:text-[26px]">Welcome back, {user.name}</h1>
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

      {!user.hasProfile && (
        <div className="mb-6 rounded-card border border-dashed border-border/60 bg-panel/50 p-4 text-[13px] text-text-dim">
          No profile row found. Insert one into <code>profile</code> in Supabase to set your display name.
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

          <QuestList quests={quests} nodeOptions={nodeOptions} />
          <SkillTreesPanel trees={trees} />
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
    </>
  );
}
