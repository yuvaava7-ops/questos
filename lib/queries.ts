import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Quest, Task, SkillProgress, DayActivity } from "@/lib/types";

const DAY_MS = 86_400_000;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getPlayerName(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) return "Hero";

  const supabase = createClient();
  const { data, error } = await supabase.from("profile").select("name").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  const name = data?.name?.trim();
  return name && name !== "You" ? name : "Hero";
}

// Total XP is derived from every completed quest rather than a stored counter,
// so it can never drift from what the quest log actually shows.
export async function getTotalXp(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;

  const supabase = createClient();
  const { data, error } = await supabase.from("quests").select("xp").eq("user_id", user.id).eq("done", true);
  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + row.xp, 0);
}

export async function getQuests(date = todayISO()): Promise<Quest[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", user.id)
    .eq("quest_date", date)
    .order("time", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((q) => ({
    id: q.id,
    label: q.label,
    time: q.time ?? "",
    done: q.done,
    xp: q.xp,
  }));
}

export async function getTasks(): Promise<Task[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((t) => ({
    id: t.id,
    label: t.label,
    priority: t.priority,
    done: t.done,
  }));
}

export async function getSkills(): Promise<SkillProgress[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    percent: s.percent,
    color: s.color,
  }));
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
  const today = new Date(`${todayISO()}T00:00:00Z`);
  const naiveStart = new Date(today.getTime() - (ACTIVITY_WEEKS * 7 - 1) * DAY_MS);
  const start = new Date(naiveStart.getTime() - naiveStart.getUTCDay() * DAY_MS);

  const user = await getCurrentUser();

  const countByDate = new Map<string, number>();
  if (user) {
    const supabase = createClient();
    const { data, error } = await supabase
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
    const date = new Date(start.getTime() + i * DAY_MS).toISOString().slice(0, 10);
    const count = countByDate.get(date) ?? 0;
    days.push({ date, level: levelForCount(count), count });
  }
  // Pad the rest of the current week so the last column still has 7 rows.
  for (let weekday = today.getUTCDay() + 1; weekday < 7; weekday++) {
    days.push({ date: "", level: 0, count: -1 });
  }

  let streakDays = 0;
  for (let i = totalPastDays - 1; i >= 0; i--) {
    if (days[i].level > 0) streakDays++;
    else if (days[i].date !== todayISO()) break;
  }

  return { days, streakDays };
}
