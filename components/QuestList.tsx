"use client";

import { useOptimistic, useRef, useTransition } from "react";
import { Plus, Sprout } from "lucide-react";
import type { Quest, SkillNodeOption } from "@/lib/types";
import { toggleQuest, addQuest, deleteQuest } from "@/lib/actions";
import { celebrateAt } from "@/lib/celebrate";
import { INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/theme";
import { Panel } from "@/components/Panel";
import { CheckToggle } from "@/components/CheckToggle";
import { RowDeleteButton } from "@/components/RowDeleteButton";

type QuestUpdate =
  | { type: "toggle"; id: string; done: boolean }
  | { type: "delete"; id: string }
  | { type: "add"; quest: Quest };

const PENDING_PREFIX = "pending-";

function reduce(quests: Quest[], update: QuestUpdate): Quest[] {
  switch (update.type) {
    case "toggle":
      return quests.map((q) => (q.id === update.id ? { ...q, done: update.done } : q));
    case "delete":
      return quests.filter((q) => q.id !== update.id);
    case "add":
      return [...quests, update.quest];
  }
}

export function QuestList({ quests, nodeOptions }: { quests: Quest[]; nodeOptions: SkillNodeOption[] }) {
  const [optimisticQuests, applyUpdate] = useOptimistic(quests, reduce);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function run(update: QuestUpdate, action: () => Promise<void>) {
    startTransition(async () => {
      applyUpdate(update);
      await action();
    });
  }

  function handleAdd(formData: FormData) {
    const label = String(formData.get("label") ?? "").trim();
    if (!label) return;
    const quest: Quest = {
      id: `${PENDING_PREFIX}${crypto.randomUUID()}`,
      label,
      time: String(formData.get("time") ?? "").trim(),
      xp: Number(formData.get("xp")) || 10,
      done: false,
      skillNodeId: String(formData.get("skill_node_id") ?? "") || null,
    };
    formRef.current?.reset();
    run({ type: "add", quest }, () => addQuest(formData));
  }

  const doneCount = optimisticQuests.filter((q) => q.done).length;
  const nodeName = new Map(nodeOptions.map((n) => [n.id, n.name]));

  return (
    <Panel
      id="today-quests"
      title="Today's Quests"
      className="scroll-mt-20"
      action={
        optimisticQuests.length > 0 && (
          <span className="font-mono text-[11px] text-text-faint">
            {doneCount}/{optimisticQuests.length} done
          </span>
        )
      }
    >
      {optimisticQuests.length === 0 && (
        <p className="py-2 text-[13px] text-text-faint">No quests logged for today yet. Add one below.</p>
      )}

      <ul>
        {optimisticQuests.map((quest) => {
          const pending = quest.id.startsWith(PENDING_PREFIX);
          return (
            <li key={quest.id} className={`group flex items-center gap-3 py-2.5 text-[13.5px] ${pending ? "opacity-60" : ""}`}>
              <CheckToggle
                checked={quest.done}
                label={quest.label}
                disabled={pending}
                onToggle={(el) => {
                  if (!quest.done) celebrateAt(el);
                  run({ type: "toggle", id: quest.id, done: !quest.done }, () => toggleQuest(quest.id, !quest.done));
                }}
              />
              <span className={`min-w-0 flex-1 break-words ${quest.done ? "text-text-faint line-through" : "text-text-dim"}`}>
                {quest.label}
                {quest.time && <span className="ml-2 text-[11px] text-text-faint">{quest.time}</span>}
                {quest.skillNodeId && nodeName.has(quest.skillNodeId) && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded bg-green-dim px-1.5 py-px align-middle text-[10.5px] text-green">
                    <Sprout size={10} aria-hidden /> {nodeName.get(quest.skillNodeId)}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-text-faint">+{quest.xp} XP</span>
              <RowDeleteButton
                label={quest.label}
                disabled={pending}
                onDelete={() => run({ type: "delete", id: quest.id }, () => deleteQuest(quest.id))}
              />
            </li>
          );
        })}
      </ul>

      <form ref={formRef} action={handleAdd} className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4 sm:flex-nowrap">
        <input name="label" placeholder="Add a quest..." aria-label="Quest name" required maxLength={200} className={`${INPUT_CLASS} min-w-0 flex-1 basis-full sm:basis-auto`} />
        {nodeOptions.length > 0 && (
          <select name="skill_node_id" defaultValue="" aria-label="Skill this quest trains" className={`${INPUT_CLASS} w-full max-w-full px-2 sm:w-[170px]`}>
            <option value="">No skill</option>
            {nodeOptions.map((n) => (
              <option key={n.id} value={n.id}>
                {n.treeName}: {n.name}
              </option>
            ))}
          </select>
        )}
        <input name="time" placeholder="7:00 AM" aria-label="Time (optional)" maxLength={20} className={`${INPUT_CLASS} w-[92px] flex-1 sm:flex-none`} />
        <input name="xp" type="number" defaultValue={10} min={1} max={1000} aria-label="XP reward" className={`${INPUT_CLASS} w-[68px] px-2`} />
        <button type="submit" aria-label="Add quest" className={`${PRIMARY_BUTTON_CLASS} flex h-9 w-9 shrink-0 items-center justify-center`}>
          <Plus size={15} />
        </button>
      </form>
    </Panel>
  );
}
