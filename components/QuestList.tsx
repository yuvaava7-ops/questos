"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Quest } from "@/lib/types";

export function QuestList({ quests: initialQuests }: { quests: Quest[] }) {
  const [quests, setQuests] = useState(initialQuests);

  function toggle(id: string) {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, done: !q.done } : q))
    );
  }

  return (
    <div className="rounded-card border border-border bg-panel p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-[14.5px] font-bold">Today&apos;s Quests</h3>
        <button className="text-xs text-blue">Edit</button>
      </div>
      {quests.map((quest) => (
        <div key={quest.id} className="flex items-center gap-2.5 py-2 text-[13.5px]">
          <button
            onClick={() => toggle(quest.id)}
            aria-pressed={quest.done}
            aria-label={`Mark "${quest.label}" as ${quest.done ? "not done" : "done"}`}
            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors ${
              quest.done ? "border-green bg-green text-bg" : "border-text-faint"
            }`}
          >
            {quest.done && <Check size={12} strokeWidth={3} />}
          </button>
          <span className={`flex-1 ${quest.done ? "text-text-dim line-through" : ""}`}>
            {quest.label}
          </span>
          <span className="font-mono text-[11px] text-text-faint">+{quest.xp} XP</span>
        </div>
      ))}
    </div>
  );
}
