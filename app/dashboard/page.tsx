import { StatCard } from "@/components/StatCard";
import { DashboardHeader } from "@/components/DashboardHeader";
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
      <DashboardHeader user={user} />

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
