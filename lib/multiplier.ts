// Streak bonus: finishing quests while on a streak earns extra XP. Based on the
// streak through yesterday, so it stays fixed for the whole day instead of
// jumping up after the first quest.

const TIERS: { minDays: number; multiplier: number }[] = [
  { minDays: 30, multiplier: 2 },
  { minDays: 14, multiplier: 1.5 },
  { minDays: 7, multiplier: 1.25 },
  { minDays: 3, multiplier: 1.1 },
];

export function streakMultiplier(streakDaysBeforeToday: number): number {
  return TIERS.find((t) => streakDaysBeforeToday >= t.minDays)?.multiplier ?? 1;
}

/** XP actually awarded for a quest worth `xp` at the given multiplier. */
export function bonusXp(xp: number, multiplier: number): number {
  return Math.max(1, Math.round(xp * multiplier));
}

/** Next tier the player is working toward, or null at the top. */
export function nextBonusTier(streakDaysBeforeToday: number): { minDays: number; multiplier: number } | null {
  const higher = [...TIERS].reverse().find((t) => t.minDays > streakDaysBeforeToday);
  return higher ?? null;
}
