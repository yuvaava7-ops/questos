"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Task } from "@/lib/types";

const PRIORITY_STYLES = {
  high: "bg-[#3a1a1e] text-[#f87171]",
  medium: "bg-orange-dim text-orange",
  low: "bg-[#182636] text-blue",
} as const;

export function TaskList({ tasks: initialTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <div className="rounded-card border border-border bg-panel p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-[14.5px] font-bold">Today&apos;s Tasks</h3>
        <button className="flex items-center gap-1 text-xs text-blue">
          <Plus size={12} /> Add Task
        </button>
      </div>
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-2.5 border-b border-[#1a2033] py-2.5 text-[13.5px] last:border-none"
        >
          <button
            onClick={() => toggle(task.id)}
            aria-pressed={task.done}
            aria-label={`Mark "${task.label}" as ${task.done ? "not done" : "done"}`}
            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors ${
              task.done ? "border-green bg-green text-bg" : "border-text-faint"
            }`}
          >
            {task.done && <Check size={12} strokeWidth={3} />}
          </button>
          <span className="flex-1">{task.label}</span>
          <span
            className={`rounded-md px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>
      ))}
    </div>
  );
}
