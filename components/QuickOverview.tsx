import { Flame, Zap, CheckCircle2, ListChecks } from "lucide-react";
import type { UserSummary, Quest, Task } from "@/lib/types";

export function QuickOverview({
  user,
  quests,
  tasks,
}: {
  user: UserSummary;
  quests: Quest[];
  tasks: Task[];
}) {
  const questsDone = quests.filter((q) => q.done).length;
  const tasksDone = tasks.filter((t) => t.done).length;

  const items = [
    { icon: Flame, value: `${user.streakDays}`, label: "Day Streak" },
    { icon: Zap, value: `${user.xp}`, label: "Total XP" },
    { icon: CheckCircle2, value: `${questsDone}/${quests.length}`, label: "Quests done" },
    { icon: ListChecks, value: `${tasksDone}/${tasks.length}`, label: "Tasks done" },
  ];

  return (
    <div className="rounded-card border border-border bg-panel p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-[14.5px] font-bold">Quick Overview</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={label} className="rounded-[10px] bg-panel2 px-2 py-3 text-center">
            <Icon size={16} className="mx-auto mb-1" />
            <div className="text-base font-extrabold">{value}</div>
            <div className="mt-0.5 text-[10.5px] text-text-faint">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
