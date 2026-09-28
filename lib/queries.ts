import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { DAY_MS, isoDate, todayISO } from "@/lib/dates";
import type { Quest, Task, SkillProgress, StatCard, DayActivity, UserSummary } from "@/lib/types";

export async function getProfile(): Promise<Omit<UserSummary, "streakDays"> | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await createClient()
    .from("profile")
    .select("name, level, level_title, xp, xp_to_next_level")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    name: data.name,
    level: data.level,
    levelTitle: data.level_title,
    xp: data.xp,
    xpToNextLevel: data.xp_to_next_level,
  };
}

export async function getQuests(date = todayISO()): Promise<Quest[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await createClient()
    .from("quests")
    .select("id, label, time, done, xp")
    .eq("user_id", user.id)
    .eq("quest_date", date)
    .order("time", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((q) => ({ id: q.id, label: q.label, time: q.time ?? "", done: q.done, xp: q.xp }));
}

export async function getTasks(): Promise<Task[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await createClient()
    .from("tasks")
    .select("id, label, priority, done")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSkills(): Promise<SkillProgress[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await createClient()
    .from("skills")
    .select("id, name, icon, percent, color")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// User-defined stat cards (Training, Nutrition, ...). The Quest Score is
// computed live from quests (lib/quest-score.ts), not stored here.
export async function getStatCards(): Promise<StatCard[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await createClient()
    .from("stat_cards")
    .select("id, label, icon, value, unit, sub, percent, color")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((s) => ({ ...s, unit: s.unit ?? undefined, sub: s.sub ?? "" }));
}

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
export async function getActivity(): Promise<{ days: DayActivity[]; streakDays: number }> {
  const todayStr = todayISO();
  const today = new Date(`${todayStr}T00:00:00Z`);
  const naiveStart = new Date(today.getTime() - (ACTIVITY_WEEKS * 7 - 1) * DAY_MS);
  const start = new Date(naiveStart.getTime() - naiveStart.getUTCDay() * DAY_MS);

  const user = await getCurrentUser();

  const countByDate = new Map<string, number>();
  if (user) {
    const { data, error } = await createClient()
      .from("quests")
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("done", true)
      .gte("completed_at", start.toISOString());
    if (error) throw error;

    for (const row of data ?? []) {
      if (!row.completed_at) continue;
      const date = row.completed_at.slice(0, 10);
      countByDate.set(date, (countByDate.get(date) ?? 0) + 1);
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
