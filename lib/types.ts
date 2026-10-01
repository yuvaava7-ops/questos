// Shared types. Keep these in sync with docs/PROJECT_SCOPE.md's data model
// section — that doc is the source of truth for the eventual Supabase schema.

export interface Quest {
  id: string;
  label: string;
  time: string;
  done: boolean;
  xp: number;
}

export interface Task {
  id: string;
  label: string;
  priority: "high" | "medium" | "low";
  done: boolean;
}

export interface SkillProgress {
  id: string;
  name: string;
  icon: string;
  percent: number; // 0-100
  color: "green" | "blue" | "purple" | "orange";
}

export interface DayActivity {
  date: string; // ISO date, "" for a not-yet-happened cell padding out the grid
  level: 0 | 1 | 2 | 3 | 4; // intensity, drives heatmap color
  count: number; // quests completed that day; -1 marks a future padding cell
}

// --- Skill tree shapes (Phase 3+, not rendered yet in the MVP) ---

export interface Perk {
  name: string;
  description: string;
  unlockCondition: "count" | "streak" | "manual";
  icon: string;
}

export interface SkillTier {
  level: number;
  xpRequired: number;
  perks: Perk[];
}

export interface SkillTree {
  id: string;
  name: string;
  icon: string;
  description: string;
  trunkStat: string;
  tiers: SkillTier[];
}
