import type { Quest } from "@/lib/types";

// Share of the day's available quest XP that has been earned, 0-100.
export function questScore(quests: Quest[]): number {
  let total = 0;
  let earned = 0;
  for (const q of quests) {
    total += q.xp;
    if (q.done) earned += q.xp;
  }
  return total > 0 ? Math.round((earned / total) * 100) : 0;
}

// null (not 0) when yesterday has no quests, so the UI omits the trend
// rather than implying a misleading "+82".
export function questScoreTrend(today: Quest[], yesterday: Quest[]): number | null {
  if (yesterday.length === 0) return null;
  return questScore(today) - questScore(yesterday);
}

export function xpPercent(xp: number, xpToNextLevel: number): number {
  if (xpToNextLevel <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((xp / xpToNextLevel) * 100)));
}
