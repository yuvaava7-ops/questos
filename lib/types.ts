// Shared types. Keep these in sync with docs/PROJECT_SCOPE.md's data model
// section — that doc is the source of truth for the eventual Supabase schema.

import type { StatKey } from "@/lib/stats";

export type Accent = "green" | "blue" | "purple" | "orange";

export interface Quest {
  id: string;
  label: string;
  time: string;
  done: boolean;
  xp: number;
  skillNodeId: string | null;
  stat: StatKey | null;
  habitId: string | null;
}

export interface Task {
  id: string;
  label: string;
  priority: "high" | "medium" | "low";
  done: boolean;
}

export interface StatCard {
  id: string;
  label: string;
  icon: string;
  value: string;
  unit?: string;
  sub: string;
  percent: number;
  color: Accent;
}

export interface DayActivity {
  date: string; // ISO date, "" for a not-yet-happened cell padding out the grid
  level: 0 | 1 | 2 | 3 | 4; // intensity, drives heatmap color
  count: number; // quests completed that day; -1 marks a future padding cell
}

export interface UserSummary {
  name: string;
  level: number;
  levelTitle: string;
  totalXp: number;
  xp: number; // XP inside the current level
  xpToNextLevel: number;
  streakDays: number;
}

// --- Skill trees ---
// Trees are graphs: each node lists the nodes it requires. One generic
// renderer (components/skills/SkillTreeGraph, a constellation view) draws every tree from these
// shapes; never special-case a specific tree.

export type SkillNodeState = "locked" | "available" | "complete" | "rusty";

export interface SkillNodeView {
  id: string;
  treeId: string;
  name: string;
  description: string;
  icon: string;
  xp: number; // earned, capped at xpRequired
  xpRequired: number;
  tier: number; // depth from the roots, derived from prerequisites
  position: number; // order within the tier
  maintenanceDays: number | null;
  lastPracticedAt: string | null;
  prerequisites: string[]; // node ids
  complete: boolean; // earned XP has reached xpRequired (stays true when rusty)
  state: SkillNodeState;
}

export interface SkillTreeView {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: Accent;
  source: "manual" | "mcp";
  createdAt: string;
  nodes: SkillNodeView[];
  completeCount: number;
  rustyCount: number;
  percent: number; // share of the tree's total required XP earned
}

// Minimal node reference for pickers (quest form, etc.).
export interface SkillNodeOption {
  id: string;
  name: string;
  treeName: string;
}
