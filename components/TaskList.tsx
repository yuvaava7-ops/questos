"use client";

import { useTransition } from "react";
import { Check, Plus, X } from "lucide-react";
import type { Task } from "@/lib/types";
import { toggleTask, addTask, deleteTask } from "@/lib/actions";

const PRIORITY_STYLES = {
  high: "bg-[#3a1a1e] text-[#f87171]",
  medium: "bg-orange-dim text-orange",
  low: "bg-[#182636] text-blue",
} as const;

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-card border border-border bg-panel p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-[14.5px] font-bold">Today&apos;s Tasks</h3>
      </div>

      {tasks.length === 0 && (
        <p className="py-2 text-[13px] text-text-faint">No tasks yet — add one below.</p>
      )}

      {tasks.map((task) => (
        <div
          key={task.id}
          className="group flex items-center gap-2.5 border-b border-[#1a2033] py-2.5 text-[13.5px] last:border-none"
        >
          <button
            onClick={() => startTransition(() => toggleTask(task.id, !task.done))}
            disabled={isPending}
            aria-pressed={task.done}
            aria-label={`Mark "${task.label}" as ${task.done ? "not done" : "done"}`}
            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors ${
              task.done ? "border-green bg-green text-bg" : "border-text-faint"
            }`}
          >
            {task.done && <Check size={12} strokeWidth={3} />}
          </button>
          <span className={`flex-1 ${task.done ? "text-text-dim line-through" : ""}`}>{task.label}</span>
          <span
            className={`rounded-md px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[task.priority]}`}
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

      <form
        action={(formData) => startTransition(() => addTask(formData))}
        className="mt-3 flex items-center gap-2 border-t border-[#1a2033] pt-3"
      >
        <input
          name="label"
          placeholder="Add a task..."
          required
          className="min-w-0 flex-1 rounded-[8px] border border-border bg-panel2 px-2.5 py-1.5 text-[13px] text-text placeholder:text-text-faint focus:outline-none"
        />
        <select
          name="priority"
          defaultValue="medium"
          className="rounded-[8px] border border-border bg-panel2 px-2 py-1.5 text-[13px] text-text focus:outline-none"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          type="submit"
          aria-label="Add task"
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] bg-blue text-bg"
        >
          <Plus size={14} />
        </button>
      </form>
    </div>
  );
}
