"use client";

import { useTransition } from "react";
import { Check, Plus, X } from "lucide-react";
import type { Quest } from "@/lib/types";
import { toggleQuest, addQuest, deleteQuest } from "@/lib/actions";
import { SectionHeading } from "@/components/SectionHeading";

export function QuestList({ quests }: { quests: Quest[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div id="today-quests" className="rounded-card border border-border/60 bg-panel p-6 scroll-mt-4">
      <SectionHeading title="Today's Quests" />

      {quests.length === 0 && (
        <p className="py-2 text-[13px] text-text-faint">No quests logged for today yet — add one below.</p>
      )}

      {quests.map((quest) => (
        <div key={quest.id} className="group flex items-center gap-3 py-2.5 text-[13.5px]">
          <button
            onClick={() => startTransition(() => toggleQuest(quest.id, !quest.done))}
            disabled={isPending}
            aria-pressed={quest.done}
            aria-label={`Mark "${quest.label}" as ${quest.done ? "not done" : "done"}`}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
              quest.done ? "border-green bg-green text-bg" : "border-text-faint/60"
            }`}
          >
            {quest.done && <Check size={12} strokeWidth={3} />}
          </button>
          <span className={`flex-1 ${quest.done ? "text-text-faint line-through" : "text-text-dim"}`}>
            {quest.label}
            {quest.time && <span className="ml-2 text-[11px] text-text-faint">{quest.time}</span>}
          </span>
          <span className="font-mono text-[11px] text-text-faint">+{quest.xp} XP</span>
          <button
            onClick={() => startTransition(() => deleteQuest(quest.id))}
            aria-label={`Delete "${quest.label}"`}
            className="opacity-0 text-text-faint transition-opacity hover:text-text group-hover:opacity-100"
          >
            <X size={13} />
          </button>
        </div>
      ))}

      <form
        action={(formData) => startTransition(() => addQuest(formData))}
        className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4"
      >
        <input
          name="label"
          placeholder="Add a quest..."
          required
          className="min-w-0 flex-1 rounded-[8px] bg-panel2 px-3 py-2 text-[13px] text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-gold/40"
        />
        <input
          name="time"
          placeholder="7:00 AM"
          className="w-[84px] rounded-[8px] bg-panel2 px-3 py-2 text-[13px] text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-gold/40"
        />
        <input
          name="xp"
          type="number"
          defaultValue={10}
          min={1}
          className="w-[56px] rounded-[8px] bg-panel2 px-2 py-2 text-[13px] text-text focus:outline-none focus:ring-1 focus:ring-gold/40"
        />
        <button
          type="submit"
          aria-label="Add quest"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-gold text-bg transition-opacity hover:opacity-90"
        >
          <Plus size={15} />
        </button>
      </form>
    </div>
  );
}
