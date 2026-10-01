import { DAY_MS } from "@/lib/dates";

// A repeating 7-day login calendar. Day 7 is the big one.
export const LOGIN_REWARDS = [5, 10, 15, 20, 30, 40, 100] as const;

// Forgiving streak: one missed day does not reset the calendar, two do.
const MAX_GAP_DAYS = 2;

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
}

export interface LoginState {
  claimedToday: boolean;
  /** The calendar day (1..7) being claimed today, or just claimed if already done. */
  cycleDay: number;
  reward: number;
  /** Days in a row claimed within the forgiveness window. */
  streak: number;
}

export function loginState(last: { claim_date: string; cycle_day: number } | null, today: string, streakSoFar: number): LoginState {
  if (last && last.claim_date === today) {
    return { claimedToday: true, cycleDay: last.cycle_day, reward: LOGIN_REWARDS[last.cycle_day - 1], streak: streakSoFar };
  }
  const continues = last !== null && daysBetween(last.claim_date, today) <= MAX_GAP_DAYS;
  const cycleDay = continues ? (last.cycle_day % 7) + 1 : 1;
  return { claimedToday: false, cycleDay, reward: LOGIN_REWARDS[cycleDay - 1], streak: continues ? streakSoFar + 1 : 1 };
}
