export const DAY_MS = 86_400_000;

// Dates are UTC calendar days, matching quest_date / completed_at bucketing.
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return isoDate(new Date());
}

export function yesterdayISO(): string {
  return isoDate(new Date(Date.now() - DAY_MS));
}
