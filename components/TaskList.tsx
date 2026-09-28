"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import type { Task } from "@/lib/types";
import { toggleTask, addTask, deleteTask } from "@/lib/actions";
import { celebrateAt } from "@/lib/celebrate";
import { ICON_BUTTON_CLASS, INPUT_CLASS } from "@/lib/theme";
import { Panel } from "@/components/Panel";
import { CheckToggle } from "@/components/CheckToggle";
import { RowDeleteButton } from "@/components/RowDeleteButton";

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  high: "border-red/30 bg-red-dim text-red",
  medium: "border-orange/30 bg-orange-dim text-orange",
  low: "border-blue/30 bg-blue-dim text-blue",
};

type TaskUpdate =
  | { type: "toggle"; id: string; done: boolean }
  | { type: "delete"; id: string }
  | { type: "add"; task: Task };

const PENDING_PREFIX = "pending-";

function reduce(tasks: Task[], update: TaskUpdate): Task[] {
  switch (update.type) {
    case "toggle":
      return tasks.map((t) => (t.id === update.id ? { ...t, done: update.done } : t));
    case "delete":
      return tasks.filter((t) => t.id !== update.id);
    case "add":
      return [update.task, ...tasks];
  }
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [optimisticTasks, applyUpdate] = useOptimistic(tasks, reduce);
  const [, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);

  function run(update: TaskUpdate, action: () => Promise<void>) {
    startTransition(async () => {
      applyUpdate(update);
      await action();
    });
  }

  function handleAdd(formData: FormData) {
    const label = String(formData.get("label") ?? "").trim();
    if (!label) return;
    const raw = String(formData.get("priority"));
    const priority: Task["priority"] = raw === "high" || raw === "low" ? raw : "medium";
    setIsAdding(false);
    run({ type: "add", task: { id: `${PENDING_PREFIX}${crypto.randomUUID()}`, label, priority, done: false } }, () =>
      addTask(formData)
    );
  }

  return (
    <Panel
      title="Tasks"
      action={
        <button
          type="button"
          onClick={() => setIsAdding((v) => !v)}
          aria-expanded={isAdding}
          className="flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-1 text-[12px] font-medium text-text-dim transition-colors hover:border-gold/50 hover:text-gold"
        >
          <Plus size={13} /> Add task
        </button>
      }
    >
      {optimisticTasks.length === 0 && !isAdding && (
        <p className="py-2 text-[13px] text-text-faint">No tasks yet. Use &ldquo;Add task&rdquo; to create one.</p>
      )}

      <ul className="-mx-2 flex flex-col gap-0.5">
        {optimisticTasks.map((task) => {
          const pending = task.id.startsWith(PENDING_PREFIX);
          return (
            <li
              key={task.id}
              className={`group flex items-center gap-3 rounded-[10px] px-2 py-2.5 text-[13.5px] transition-colors hover:bg-white/[0.03] ${pending ? "opacity-60" : ""}`}
            >
              <CheckToggle
                checked={task.done}
                label={task.label}
                disabled={pending}
                onToggle={(el) => {
                  if (!task.done) celebrateAt(el);
                  run({ type: "toggle", id: task.id, done: !task.done }, () => toggleTask(task.id, !task.done));
                }}
              />
              <span className={`min-w-0 flex-1 break-words ${task.done ? "text-text-faint line-through decoration-text-faint/60" : "text-text"}`}>
                {task.label}
              </span>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_STYLES[task.priority]}`}>
                {task.priority}
              </span>
              <RowDeleteButton
                label={task.label}
                disabled={pending}
                onDelete={() => run({ type: "delete", id: task.id }, () => deleteTask(task.id))}
              />
            </li>
          );
        })}
      </ul>

      {isAdding && (
        <form action={handleAdd} className="mt-4 flex items-center gap-2 border-t border-border/50 pt-4">
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- form only mounts when the user explicitly opens it */}
          <input name="label" placeholder="Add a task..." aria-label="Task name" required maxLength={200} autoFocus className={`${INPUT_CLASS} min-w-0 flex-1`} />
          <select name="priority" defaultValue="medium" aria-label="Priority" className={`${INPUT_CLASS} px-2`}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button type="submit" aria-label="Add task" className={ICON_BUTTON_CLASS}>
            <Plus size={15} />
          </button>
        </form>
      )}
    </Panel>
  );
}
