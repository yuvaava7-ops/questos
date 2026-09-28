import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { computeActivity } from "@/lib/activity";
import { getSkillNodeOptions, getSkillTrees, getXpTotals, type XpTotals } from "@/lib/skill-data";
import { levelFromTotalXp } from "@/lib/leveling";
import type { Quest, Task, StatCard, DayActivity, SkillNodeOption, SkillTreeView, UserSummary } from "@/lib/types";

// Only the display name is read from profile; level/XP come from the
// xp_events ledger (see getXpProgress + lib/leveling.ts).
export const getProfileName = cache(async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await createClient().from("profile").select("name").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  return data?.name ?? null;
});

export const getXpProgress = cache(async (): Promise<XpTotals> => {
  const user = await getCurrentUser();
  if (!user) return { total: 0, byNode: new Map() };
  return getXpTotals(createClient(), user.id);
});

export async function getTrees(xp?: XpTotals): Promise<SkillTreeView[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return getSkillTrees(createClient(), user.id, xp);
}

export async function getNodeOptions(): Promise<SkillNodeOption[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return getSkillNodeOptions(createClient(), user.id);
}

export async function getQuests(date = todayISO()): Promise<Quest[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await createClient()
    .from("quests")
    .select("id, label, time, done, xp, skill_node_id")
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
    skillNodeId: q.skill_node_id,
  }));
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

// cache(): the dashboard layout and page both need these within one request.
export const getActivity = cache(async (): Promise<{ days: DayActivity[]; streakDays: number }> => {
  const user = await getCurrentUser();
  return computeActivity(user ? createClient() : null, user?.id ?? null);
});

export const getUserSummary = cache(async (): Promise<UserSummary & { hasProfile: boolean }> => {
  const [name, xp, { streakDays }] = await Promise.all([getProfileName(), getXpProgress(), getActivity()]);
  const progress = levelFromTotalXp(xp.total);
  return {
    name: name ?? "You",
    hasProfile: name !== null,
    level: progress.level,
    levelTitle: progress.levelTitle,
    totalXp: progress.totalXp,
    xp: progress.xp,
    xpToNextLevel: progress.xpToNextLevel,
    streakDays,
  };
});
