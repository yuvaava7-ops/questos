import { DAY_MS, isoDate } from "@/lib/dates";

/** Monday (UTC) of the week containing `date`, as YYYY-MM-DD. */
export function weekStartOf(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const sinceMonday = (d.getUTCDay() + 6) % 7;
  return isoDate(new Date(d.getTime() - sinceMonday * DAY_MS));
}

/** Whole days left in the boss week, counting today (7 on Monday, 1 on Sunday). */
export function daysLeftInWeek(date = new Date()): number {
  return 7 - ((date.getUTCDay() + 6) % 7);
}

export const BOSS_PRESETS = [
  { hp: 200, label: "Light", reward: 50 },
  { hp: 400, label: "Normal", reward: 100 },
  { hp: 800, label: "Hard", reward: 200 },
  { hp: 1500, label: "Legendary", reward: 400 },
] as const;

export type BossLook = "slime" | "skull" | "eye";

export function bossLook(hp: number): BossLook {
  return hp < 400 ? "slime" : hp < 1000 ? "skull" : "eye";
}

export interface BossState {
  id: string;
  name: string;
  hp: number;
  /** XP of real work done this week. */
  damage: number;
  rewardXp: number;
  defeated: boolean;
  claimed: boolean;
  daysLeft: number;
}
