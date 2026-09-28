import { Flame, Zap, CheckCircle2, ListChecks } from "lucide-react";
import type { UserSummary, Quest, Task } from "@/lib/types";
import { Panel } from "@/components/Panel";

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
    { icon: Flame, value: `${user.streakDays}`, label: "Day streak", tint: "text-orange bg-orange-dim" },
    { icon: Zap, value: user.totalXp.toLocaleString(), label: "Total XP", tint: "text-gold bg-gold-dim" },
    { icon: CheckCircle2, value: `${questsDone}/${quests.length}`, label: "Quests today", tint: "text-green bg-green-dim" },
    { icon: ListChecks, value: `${tasksDone}/${tasks.length}`, label: "Tasks", tint: "text-blue bg-blue-dim" },
  ];

  return (
    <Panel title="Overview">
      <div className="grid grid-cols-2 gap-2.5">
        {items.map(({ icon: Icon, value, label, tint }) => (
          <div key={label} className="tile flex items-center gap-3 p-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] ${tint}`}>
              <Icon size={16} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <div className="truncate text-[16px] font-bold leading-none tracking-tight">{value}</div>
              <div className="mt-1 text-[11px] leading-tight text-text-faint">{label}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 border-l-2 border-gold/40 pl-3 text-[12.5px] italic leading-relaxed text-text-dim">
        {quoteOfTheDay()}
      </p>
    </Panel>
  );
}
