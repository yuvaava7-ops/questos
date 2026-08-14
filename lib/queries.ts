import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type {
  Quest,
  Task,
  SkillProgress,
  StatCard,
  DayActivity,
  UserSummary,
} from "@/lib/types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getProfile(): Promise<Omit<UserSummary, "streakDays"> | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profile")
    .select("*")
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

// "Quest Score" is always computed live from today's quests; any rows in
// stat_cards (Training, Nutrition, custom trackers, ...) are appended after it.
export async function getStatCards(quests: Quest[]): Promise<StatCard[]> {
  const totalXp = quests.reduce((sum, q) => sum + q.xp, 0);
  const earnedXp = quests.filter((q) => q.done).reduce((sum, q) => sum + q.xp, 0);
  const donePercent = totalXp > 0 ? Math.round((earnedXp / totalXp) * 100) : 0;
  const doneCount = quests.filter((q) => q.done).length;

  const questScore: StatCard = {
    id: "quest-score",
    label: "Quest Score",
    icon: "Target",
    value: String(donePercent),
    unit: "/100",
    sub: quests.length > 0 ? `${doneCount}/${quests.length} quests done today` : "No quests logged today",
    percent: donePercent,
    color: "green",
  };

  const user = await getCurrentUser();
  if (!user) return [questScore];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("stat_cards")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const custom: StatCard[] = (data ?? []).map((s) => ({
    id: s.id,
    label: s.label,
    icon: s.icon,
    value: s.value,
    unit: s.unit ?? undefined,
    sub: s.sub ?? "",
    percent: s.percent,
    color: s.color,
  }));

  return [questScore, ...custom];
}

const ACTIVITY_WEEKS = 53;
const DAY_MS = 86_400_000;

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
