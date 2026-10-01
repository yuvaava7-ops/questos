import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { computeActivity } from "@/lib/activity";
import { DAY_MS, isoDate, todayISO } from "@/lib/dates";
import { levelFromTotalXp } from "@/lib/leveling";
import { getSkillTrees, getXpTotals, awardXp } from "@/lib/skill-data";
import { classFor, emptyStatXp, isStatKey, STAT_KEYS, statLevel, type StatKey, type StatXp } from "@/lib/stats";
import { ACHIEVEMENTS, newlyEarned, type AchievementDef, type Facts } from "@/lib/achievements";
import { daysLeftInWeek, weekStartOf, type BossState } from "@/lib/boss";
import { loginState, type LoginState } from "@/lib/login-rewards";
import { streakMultiplier } from "@/lib/multiplier";
import { parseAvatar, type Avatar } from "@/lib/avatar";

type Db = SupabaseClient;

// These features need migration 004. Until it is applied they degrade to
// "nothing here" instead of taking the dashboard down.
export async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[game] ${label} unavailable:`, e instanceof Error ? e.message : e);
    return fallback;
  }
}

// ---------- dailies ----------

export interface Habit {
  id: string;
  label: string;
  xp: number;
  stat: StatKey | null;
  skillNodeId: string | null;
  weekdays: number[];
  time: string;
  active: boolean;
  streak: number;
}

/** Creates today's quest for every active habit scheduled today (idempotent). */
export async function ensureDailies(db: Db, userId: string): Promise<void> {
  const today = todayISO();
  const dow = new Date().getUTCDay();
  const { data, error } = await db
    .from("habits")
    .select("id, label, xp, stat, skill_node_id, time, weekdays")
    .eq("user_id", userId)
    .eq("active", true);
  if (error) throw error;
  const due = (data ?? []).filter((h) => (h.weekdays as number[]).includes(dow));
  if (due.length === 0) return;
  const { error: upsertError } = await db.from("quests").upsert(
    due.map((h) => ({
      user_id: userId,
      label: h.label,
      xp: h.xp,
      time: h.time,
      stat: h.stat,
      skill_node_id: h.skill_node_id,
      habit_id: h.id,
      quest_date: today,
    })),
    { onConflict: "habit_id,quest_date", ignoreDuplicates: true }
  );
  if (upsertError) throw upsertError;
}

export async function getHabits(db: Db, userId: string): Promise<Habit[]> {
  const since = isoDate(new Date(Date.now() - 90 * DAY_MS));
  const [habits, done] = await Promise.all([
    db.from("habits").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    db
      .from("quests")
      .select("habit_id, quest_date")
      .eq("user_id", userId)
      .eq("done", true)
      .not("habit_id", "is", null)
      .gte("quest_date", since),
  ]);
  if (habits.error) throw habits.error;
  if (done.error) throw done.error;

  const doneDays = new Map<string, Set<string>>();
  for (const row of done.data ?? []) {
    const set = doneDays.get(row.habit_id) ?? new Set<string>();
    set.add(row.quest_date);
    doneDays.set(row.habit_id, set);
  }

  const today = todayISO();
  return (habits.data ?? []).map((h) => {
    const days = doneDays.get(h.id) ?? new Set<string>();
    const weekdays = h.weekdays as number[];
    // Walk back from today: unscheduled days are skipped, a missed scheduled day ends the streak,
    // and today not being done yet does not break it.
    let streak = 0;
    for (let i = 0; i < 90; i++) {
      const d = new Date(Date.now() - i * DAY_MS);
      const iso = isoDate(d);
      if (!weekdays.includes(d.getUTCDay())) continue;
      if (days.has(iso)) streak++;
      else if (iso !== today) break;
    }
    return {
      id: h.id,
      label: h.label,
      xp: h.xp,
      stat: isStatKey(h.stat) ? h.stat : null,
      skillNodeId: h.skill_node_id,
      weekdays,
      time: h.time ?? "",
      active: h.active,
      streak,
    };
  });
}

// ---------- streak bonus ----------

/** Streak through yesterday: today's own progress must not change today's bonus. */
export async function streakBeforeToday(db: Db, userId: string): Promise<number> {
  const { days, streakDays } = await computeActivity(db, userId);
  const today = days.find((d) => d.date === todayISO());
  return today && today.count > 0 ? Math.max(0, streakDays - 1) : streakDays;
}

export async function currentMultiplier(db: Db, userId: string): Promise<number> {
  return streakMultiplier(await streakBeforeToday(db, userId));
}

// ---------- weekly boss ----------

export async function getBoss(db: Db, userId: string): Promise<BossState | null> {
  const weekStart = weekStartOf();
  const { data, error } = await db.from("bosses").select("*").eq("user_id", userId).eq("week_start", weekStart).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const dmg = await db.rpc("xp_since", { p_user_id: userId, p_since: `${weekStart}T00:00:00Z` });
  if (dmg.error) throw dmg.error;
  const damage = Number(dmg.data ?? 0);

  let defeated = data.defeated_at !== null;
  if (!defeated && damage >= data.hp) {
    const { error: upErr } = await db.from("bosses").update({ defeated_at: new Date().toISOString() }).eq("id", data.id);
    if (upErr) throw upErr;
    defeated = true;
  }
  return {
    id: data.id,
    name: data.name,
    hp: data.hp,
    damage,
    rewardXp: data.reward_xp,
    defeated,
    claimed: data.claimed_at !== null,
    daysLeft: daysLeftInWeek(),
  };
}

// ---------- login rewards ----------

export async function getLoginState(db: Db, userId: string): Promise<LoginState> {
  const { data, error } = await db
    .from("login_claims")
    .select("claim_date, cycle_day")
    .eq("user_id", userId)
    .order("claim_date", { ascending: false })
    .limit(60);
  if (error) throw error;
  const claims = data ?? [];
  // Length of the unbroken chain (gaps of up to 2 days) ending at the latest claim.
  let chain = claims.length > 0 ? 1 : 0;
  for (let i = 1; i < claims.length; i++) {
    const gap = (Date.parse(claims[i - 1].claim_date) - Date.parse(claims[i].claim_date)) / DAY_MS;
    if (gap <= 2) chain++;
    else break;
  }
  return loginState(claims[0] ?? null, todayISO(), chain);
}

// ---------- achievements ----------

async function gatherFacts(db: Db, userId: string): Promise<Facts> {
  const [done, xp, activity, statRows, trees, bosses, habits, claims] = await Promise.all([
    db.from("quests").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("done", true),
    getXpTotals(db, userId),
    computeActivity(db, userId),
    db.rpc("stat_xp", { p_user_id: userId }),
    getSkillTrees(db, userId),
    db.from("bosses").select("id", { count: "exact", head: true }).eq("user_id", userId).not("defeated_at", "is", null),
    db.from("habits").select("id", { count: "exact", head: true }).eq("user_id", userId),
    db.from("login_claims").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  const statXp: StatXp = emptyStatXp();
  for (const row of (statRows.data ?? []) as { stat: string; xp: number }[]) {
    if (isStatKey(row.stat)) statXp[row.stat] = Number(row.xp);
  }
  return {
    questsDone: done.count ?? 0,
    streakDays: activity.streakDays,
    level: levelFromTotalXp(xp.total).level,
    hasClass: classFor(statXp).primary !== null,
    topStatLevel: Math.max(...STAT_KEYS.map((k) => statLevel(statXp[k]).value)),
    treesCreated: trees.length,
    nodesComplete: trees.reduce((s, t) => s + t.completeCount, 0),
    treesComplete: trees.filter((t) => t.nodes.length > 0 && t.completeCount === t.nodes.length).length,
    bossesDefeated: bosses.count ?? 0,
    habits: habits.count ?? 0,
    loginClaims: claims.count ?? 0,
  };
}

export async function getUnlockedKeys(db: Db, userId: string): Promise<{ key: string; unlockedAt: string }[]> {
  const { data, error } = await db.from("achievements").select("key, unlocked_at").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => ({ key: r.key, unlockedAt: r.unlocked_at }));
}

/** Unlocks (and pays out) any achievements now earned. Returns the new ones. */
export async function evaluateAchievements(db: Db, userId: string): Promise<AchievementDef[]> {
  const unlocked = new Set((await getUnlockedKeys(db, userId)).map((a) => a.key));
  const fresh: AchievementDef[] = [];
  // Rewards can level you up, which can unlock more: a few passes settle it.
  for (let pass = 0; pass < 3; pass++) {
    const earned = newlyEarned(await gatherFacts(db, userId), unlocked);
    if (earned.length === 0) break;
    const { error } = await db
      .from("achievements")
      .upsert(earned.map((a) => ({ user_id: userId, key: a.key })), { onConflict: "user_id,key", ignoreDuplicates: true });
    if (error) throw error;
    for (const a of earned) {
      unlocked.add(a.key);
      fresh.push(a);
      await awardXp(db, userId, { amount: a.reward, source: "achievement", note: a.name });
    }
  }
  return fresh;
}

// ---------- public hero card ----------

export interface PublicHero {
  name: string;
  slug: string;
  avatar: Avatar | null;
  level: number;
  levelTitle: string;
  title: string | null;
  className: string;
  classBlurb: string;
  primary: StatKey | null;
  stats: Record<StatKey, { xp: number; level: number; fraction: number }>;
  streakDays: number;
  trees: { name: string; percent: number; color: string; nodes: number; complete: number }[];
  achievements: number;
  achievementsTotal: number;
}

/** Only fields the owner has opted to show on their public card. Needs a service-role client. */
export async function getPublicHero(db: Db, slug: string): Promise<PublicHero | null> {
  const { data: profile, error } = await db
    .from("profile")
    .select("*")
    .eq("public_slug", slug.toLowerCase())
    .eq("is_public", true)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;
  const userId: string = profile.user_id;

  const [xp, activity, statRows, trees, unlocked] = await Promise.all([
    getXpTotals(db, userId),
    computeActivity(db, userId),
    db.rpc("stat_xp", { p_user_id: userId }),
    getSkillTrees(db, userId),
    db.from("achievements").select("key").eq("user_id", userId),
  ]);
  const statXp = emptyStatXp();
  for (const row of (statRows.data ?? []) as { stat: string; xp: number }[]) {
    if (isStatKey(row.stat)) statXp[row.stat] = Number(row.xp);
  }
  const heroClass = classFor(statXp);
  const level = levelFromTotalXp(xp.total);
  const title = ACHIEVEMENTS.find((a) => a.key === profile.title_key)?.name ?? null;

  return {
    name: profile.name && profile.name !== "You" ? profile.name : "Hero",
    slug: profile.public_slug,
    avatar: parseAvatar(profile.avatar),
    level: level.level,
    levelTitle: level.levelTitle,
    title,
    className: heroClass.name,
    classBlurb: heroClass.blurb,
    primary: heroClass.primary,
    stats: Object.fromEntries(
      STAT_KEYS.map((k) => {
        const l = statLevel(statXp[k]);
        return [k, { xp: statXp[k], level: l.value, fraction: l.fraction }];
      })
    ) as PublicHero["stats"],
    streakDays: activity.streakDays,
    trees: trees.map((t) => ({ name: t.name, percent: t.percent, color: t.color, nodes: t.nodes.length, complete: t.completeCount })),
    achievements: unlocked.data?.length ?? 0,
    achievementsTotal: ACHIEVEMENTS.length,
  };
}
