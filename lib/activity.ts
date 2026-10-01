import type { SupabaseClient } from "@supabase/supabase-js";
import { DAY_MS, isoDate, todayISO } from "@/lib/dates";
import type { DayActivity } from "@/lib/types";

// Shared by the dashboard (RLS client) and the MCP endpoint (service client).

const ACTIVITY_WEEKS = 53;

// Buckets a day's completed-quest count into a heatmap intensity level,
// mirroring GitHub's contribution-graph tiering.
function levelForCount(count: number): DayActivity["level"] {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

// Builds a Sunday-aligned grid ending today, exactly like GitHub's
// contribution graph: full calendar weeks as columns, with the current
// (partial) week padded out with blank future cells so every column has 7 rows.
export async function computeActivity(
  db: SupabaseClient | null,
  userId: string | null
): Promise<{ days: DayActivity[]; streakDays: number }> {
  const todayStr = todayISO();
  const today = new Date(`${todayStr}T00:00:00Z`);
  const naiveStart = new Date(today.getTime() - (ACTIVITY_WEEKS * 7 - 1) * DAY_MS);
  const start = new Date(naiveStart.getTime() - naiveStart.getUTCDay() * DAY_MS);

  // Counted in Postgres: fetching raw rows would be silently capped by
  // PostgREST's max-rows limit once a year holds 1000+ completed quests.
  const countByDate = new Map<string, number>();
  if (db && userId) {
    const { data, error } = await db.rpc("activity_counts", {
      p_user_id: userId,
      p_since: start.toISOString(),
    });
    if (error) throw error;
    for (const row of (data ?? []) as { day: string; completed: number }[]) {
      countByDate.set(row.day, Number(row.completed));
    }
  }

  const days: DayActivity[] = [];
  const totalPastDays = Math.round((today.getTime() - start.getTime()) / DAY_MS) + 1;
  for (let i = 0; i < totalPastDays; i++) {
    const date = isoDate(new Date(start.getTime() + i * DAY_MS));
    const count = countByDate.get(date) ?? 0;
    days.push({ date, level: levelForCount(count), count });
  }
  // Pad the rest of the current week so the last column still has 7 rows.
  for (let weekday = today.getUTCDay() + 1; weekday < 7; weekday++) {
    days.push({ date: "", level: 0, count: -1 });
  }

  // Today not being done yet doesn't break the streak; any earlier gap does.
  let streakDays = 0;
  for (let i = totalPastDays - 1; i >= 0; i--) {
    if (days[i].level > 0) streakDays++;
    else if (days[i].date !== todayStr) break;
  }

  return { days, streakDays };
}
