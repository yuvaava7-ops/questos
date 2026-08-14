"use client";

import { useState, useTransition } from "react";
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
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="rounded-card border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold">Today&apos;s Tasks</h3>
        <button
          onClick={() => setIsAdding((v) => !v)}
          className="flex items-center gap-1 rounded-[8px] px-2 py-1 text-[12px] font-semibold text-blue transition-colors hover:bg-blue-dim"
        >
          <Plus size={13} /> Add Task
        </button>
      </div>

      {tasks.length === 0 && !isAdding && (
        <p className="py-2 text-[13px] text-text-faint">No tasks yet — add one below.</p>
      )}

      {tasks.map((task) => (
        <div
          key={task.id}
          className="group flex items-center gap-3 border-b border-[#1a2033] py-2.5 text-[13.5px] last:border-none"
        >
          <button
            onClick={() => startTransition(() => toggleTask(task.id, !task.done))}
            disabled={isPending}
            aria-pressed={task.done}
            aria-label={`Mark "${task.label}" as ${task.done ? "not done" : "done"}`}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors ${
              task.done ? "border-green bg-green text-bg" : "border-text-faint"
            }`}
          >
            {task.done && <Check size={13} strokeWidth={3} />}
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

      {isAdding && (
        <form
          action={(formData) => {
            startTransition(() => addTask(formData));
            setIsAdding(false);
          }}
          className="mt-3 flex items-center gap-2 border-t border-[#1a2033] pt-3"
        >
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- form only mounts when the user explicitly opens it */}
          <input
            name="label"
            placeholder="Add a task..."
            required
            autoFocus
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
      )}
    </div>
  );
}
