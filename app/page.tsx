import { Bell, Home as HomeIcon } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { QuestList } from "@/components/QuestList";
import { SkillProgressPanel } from "@/components/SkillProgressPanel";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { TaskList } from "@/components/TaskList";
import { QuickOverview } from "@/components/QuickOverview";
import { user, stats, quests, skills, tasks, generateActivity } from "@/data/sample";

export default function DashboardPage() {
  const activity = generateActivity();

  return (
    <>
      <Sidebar user={user} />

      <main className="max-w-[1100px] flex-1 px-6 py-8 md:px-10">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight">
              Good morning, {user.name} 👋
            </h1>
            <div className="mt-2 flex gap-3.5 text-[13px] font-medium text-text-dim">
              <span>🔥 Streak: <strong className="text-text">{user.streakDays} days</strong></span>
              <span>⭐ Level: <strong className="text-text">{user.level}</strong></span>
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

        <div className="mb-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div className="mb-3.5 grid gap-3.5 lg:grid-cols-2">
          <QuestList quests={quests} />
          <SkillProgressPanel skills={skills} />
        </div>

        <ActivityHeatmap days={activity} streakDays={user.streakDays} />

        <div className="grid gap-3.5 lg:grid-cols-2">
          <TaskList tasks={tasks} />
          <QuickOverview user={user} quests={quests} lastNightSleep="7h 50m" />
        </div>
      </main>
    </>
  );
}
