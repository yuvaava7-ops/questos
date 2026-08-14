import { Flame, Zap, CheckCircle2, ListChecks } from "lucide-react";
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
    { icon: Flame, value: `${user.streakDays}`, label: "Day Streak" },
    { icon: Zap, value: `${user.xp}`, label: "Total XP" },
    { icon: CheckCircle2, value: `${questsDone}/${quests.length}`, label: "Quests done" },
    { icon: ListChecks, value: `${tasksDone}/${tasks.length}`, label: "Tasks done" },
  ];

  return (
    <div className="rounded-card border border-border/60 bg-panel p-6">
      <h3 className="mb-5 text-[15px] font-semibold tracking-tight">Quick Overview</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon size={17} strokeWidth={1.75} className="shrink-0 text-text-faint" />
            <div>
              <div className="text-[17px] font-semibold leading-none tracking-tight">{value}</div>
              <div className="mt-1 text-[11.5px] text-text-faint">{label}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 border-t border-border/60 pt-4 text-[12.5px] italic leading-relaxed text-text-faint">
        {quoteOfTheDay()}
      </p>
    </div>
  );
}
