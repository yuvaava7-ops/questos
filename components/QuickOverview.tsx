import { Flame, Zap, CheckCircle2, ListChecks, Sparkles } from "lucide-react";
import type { UserSummary, Quest, Task } from "@/lib/types";

const QUOTES = [
  "Every quest completed is XP that never disappears.",
  "The grind is the game.",
  "Small quests, compounded, become legendary runs.",
  "Consistency beats intensity, every time.",
  "Show up. Log the quest. Level up.",
  "Your streak is the real boss fight.",
  "Discipline is just XP farming for your future self.",
];

function quoteOfTheDay(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length];
}

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
    { icon: Flame, value: `${user.streakDays}`, label: "Day Streak", badge: "bg-orange-dim text-orange" },
    { icon: Zap, value: `${user.xp}`, label: "Total XP", badge: "bg-purple-dim text-purple" },
    { icon: CheckCircle2, value: `${questsDone}/${quests.length}`, label: "Quests done", badge: "bg-green-dim text-green" },
    { icon: ListChecks, value: `${tasksDone}/${tasks.length}`, label: "Tasks done", badge: "bg-blue-dim text-blue" },
  ];

  return (
    <div className="rounded-card border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold">Quick Overview</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ icon: Icon, value, label, badge }) => (
          <div key={label} className="rounded-[10px] bg-panel2 px-2 py-3.5 text-center">
            <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full ${badge}`}>
              <Icon size={16} />
            </div>
            <div className="text-base font-extrabold">{value}</div>
            <div className="mt-0.5 text-[10.5px] text-text-faint">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-[10px] border border-border bg-panel2 p-3.5">
        <div className="flex items-start gap-2">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-purple" />
          <p className="text-[12.5px] italic leading-relaxed text-text-dim">{quoteOfTheDay()}</p>
        </div>
      </div>
    </div>
  );
}
