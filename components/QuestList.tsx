"use client";

import { useTransition } from "react";
import { Check, Plus, X } from "lucide-react";
import type { Quest } from "@/lib/types";
import { toggleQuest, addQuest, deleteQuest } from "@/lib/actions";

export function QuestList({ quests }: { quests: Quest[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-card border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold">Today&apos;s Quests</h3>
      </div>

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
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors ${
              quest.done ? "border-green bg-green text-bg" : "border-text-faint"
            }`}
          >
            {quest.done && <Check size={13} strokeWidth={3} />}
          </button>
          <span className={`flex-1 ${quest.done ? "text-text-dim line-through" : ""}`}>
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
        className="mt-3 flex items-center gap-2 border-t border-[#1a2033] pt-3"
      >
        <input
          name="label"
          placeholder="Add a quest..."
          required
          className="min-w-0 flex-1 rounded-[8px] border border-border bg-panel2 px-2.5 py-1.5 text-[13px] text-text placeholder:text-text-faint focus:outline-none"
        />
        <input
          name="time"
          placeholder="7:00 AM"
          className="w-[88px] rounded-[8px] border border-border bg-panel2 px-2.5 py-1.5 text-[13px] text-text placeholder:text-text-faint focus:outline-none"
        />
        <input
          name="xp"
          type="number"
          defaultValue={10}
          min={1}
          className="w-[60px] rounded-[8px] border border-border bg-panel2 px-2.5 py-1.5 text-[13px] text-text focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Add quest"
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] bg-blue text-bg"
        >
          <Plus size={14} />
        </button>
      </form>
    </div>
  );
}
