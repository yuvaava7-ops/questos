"use client";

import { useState, useTransition } from "react";
import { Check, Plus, X } from "lucide-react";
import type { Task } from "@/lib/types";
import { toggleTask, addTask, deleteTask } from "@/lib/actions";
import { SectionHeading } from "@/components/SectionHeading";

const PRIORITY_STYLES = {
  high: "bg-[#3a1a1e] text-[#f87171]",
  medium: "bg-orange-dim text-orange",
  low: "bg-[#182636] text-blue",
} as const;

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="rounded-card border border-border/60 bg-panel p-6">
      <SectionHeading title="Today's Tasks">
        <button
          onClick={() => setIsAdding((v) => !v)}
          className="flex items-center gap-1 rounded-[8px] px-2 py-1 text-[12px] font-medium text-text-faint transition-colors hover:text-gold"
        >
          <Plus size={13} /> Add Task
        </button>
      </SectionHeading>

      {tasks.length === 0 && !isAdding && (
        <p className="py-2 text-[13px] text-text-faint">No tasks yet — add one below.</p>
      )}

      {tasks.map((task) => (
        <div
          key={task.id}
          className="group flex items-center gap-3 border-b border-border/40 py-2.5 text-[13.5px] last:border-none"
        >
          <button
            onClick={() => startTransition(() => toggleTask(task.id, !task.done))}
            disabled={isPending}
            aria-pressed={task.done}
            aria-label={`Mark "${task.label}" as ${task.done ? "not done" : "done"}`}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
              task.done ? "border-green bg-green text-bg" : "border-text-faint/60"
            }`}
          >
            {task.done && <Check size={12} strokeWidth={3} />}
          </button>
          <span className={`flex-1 ${task.done ? "text-text-faint line-through" : "text-text-dim"}`}>{task.label}</span>
          <span
            className={`rounded-md px-2 py-[3px] text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_STYLES[task.priority]}`}
          >
            {task.priority}
          </span>
          <button
            onClick={() => startTransition(() => deleteTask(task.id))}
            aria-label={`Delete "${task.label}"`}
            className="opacity-0 text-text-faint transition-opacity hover:text-text group-hover:opacity-100"
          >
            <X size={13} />
          </button>
        </div>
      ))}

      {isAdding && (
        <form
          action={(formData) => {
            startTransition(() => addTask(formData));
            setIsAdding(false);
          }}
          className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4"
        >
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- form only mounts when the user explicitly opens it */}
          <input
            name="label"
            placeholder="Add a task..."
            required
            autoFocus
            className="min-w-0 flex-1 rounded-[8px] bg-panel2 px-3 py-2 text-[13px] text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-gold/40"
          />
          <select
            name="priority"
            defaultValue="medium"
            className="rounded-[8px] bg-panel2 px-2 py-2 text-[13px] text-text focus:outline-none focus:ring-1 focus:ring-gold/40"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            type="submit"
            aria-label="Add task"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-gold text-bg transition-opacity hover:opacity-90"
          >
            <Plus size={15} />
          </button>
        </form>
      )}
    </div>
  );
}
