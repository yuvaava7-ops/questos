"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { awardXp } from "@/lib/skill-data";
import { isStatKey } from "@/lib/stats";
import { BOSS_PRESETS, weekStartOf } from "@/lib/boss";
import { ACHIEVEMENT_BY_KEY } from "@/lib/achievements";
import { ensureDailies, getLoginState } from "@/lib/game-data";
import { LOGIN_REWARDS } from "@/lib/login-rewards";

const MAX_LABEL = 120;

function refresh() {
  revalidatePath("/dashboard", "layout");
}

// ---------- dailies ----------

export async function addHabit(formData: FormData): Promise<{ error?: string }> {
  const user = await requireUser();
  const label = String(formData.get("label") ?? "").trim().slice(0, MAX_LABEL);
  if (!label) return { error: "Give the daily a name." };
  const rawXp = Math.round(Number(formData.get("xp")));
  const xp = Number.isFinite(rawXp) && rawXp > 0 ? Math.min(rawXp, 1000) : 10;
  const rawStat = String(formData.get("stat") ?? "");
  const stat = isStatKey(rawStat) ? rawStat : null;
  const time = String(formData.get("time") ?? "").trim().slice(0, 20) || null;
  const weekdays = [
    ...new Set(
      String(formData.get("weekdays") ?? "")
        .split(",")
        .map(Number)
        .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
    ),
  ].sort();
  if (weekdays.length === 0) return { error: "Pick at least one day." };

  const db = createClient();
  const { error } = await db.from("habits").insert({ user_id: user.id, label, xp, stat, time, weekdays });
  if (error) return { error: error.message };
  await ensureDailies(db, user.id).catch(() => undefined);
  refresh();
  return {};
}

export async function setHabitActive(id: string, active: boolean) {
  const user = await requireUser();
  const { error } = await createClient().from("habits").update({ active }).eq("id", id).eq("user_id", user.id);
  if (error) throw error;
  refresh();
}

export async function deleteHabit(id: string) {
  const user = await requireUser();
  const { error } = await createClient().from("habits").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
  refresh();
}

// ---------- weekly boss ----------

export async function summonBoss(formData: FormData): Promise<{ error?: string }> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  if (!name) return { error: "Name your boss." };
  const hp = Number(formData.get("hp"));
  const preset = BOSS_PRESETS.find((p) => p.hp === hp);
  if (!preset) return { error: "Pick a difficulty." };

  const { error } = await createClient()
    .from("bosses")
    .insert({ user_id: user.id, week_start: weekStartOf(), name, hp: preset.hp, reward_xp: preset.reward });
  if (error) return { error: error.code === "23505" ? "You already summoned a boss this week." : error.message };
  refresh();
  return {};
}

export async function claimBoss(): Promise<void> {
  const user = await requireUser();
  const db = createClient();
  // The conditional update makes the claim atomic: only one caller gets the row back.
  const { data, error } = await db
    .from("bosses")
    .update({ claimed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("week_start", weekStartOf())
    .not("defeated_at", "is", null)
    .is("claimed_at", null)
    .select("name, reward_xp")
    .maybeSingle();
  if (error) throw error;
  if (data && data.reward_xp > 0) await awardXp(db, user.id, { amount: data.reward_xp, source: "boss", note: `Defeated ${data.name}` });
  refresh();
}

// ---------- login rewards ----------

export async function claimLogin(): Promise<void> {
  const user = await requireUser();
  const db = createClient();
  const state = await getLoginState(db, user.id);
  if (state.claimedToday) return;
  const xp = LOGIN_REWARDS[state.cycleDay - 1];
  // The unique (user_id, claim_date) index makes a double-click harmless.
  const { error } = await db.from("login_claims").insert({ user_id: user.id, claim_date: todayISO(), cycle_day: state.cycleDay, xp });
  if (error) {
    if (error.code === "23505") return;
    throw error;
  }
  await awardXp(db, user.id, { amount: xp, source: "login", note: `Login reward, day ${state.cycleDay}` });
  refresh();
}

// ---------- titles & public card ----------

export async function equipTitle(key: string | null): Promise<void> {
  const user = await requireUser();
  const db = createClient();
  if (key !== null) {
    if (!ACHIEVEMENT_BY_KEY.has(key)) return;
    const { data } = await db.from("achievements").select("key").eq("user_id", user.id).eq("key", key).maybeSingle();
    if (!data) return;
  }
  const { error } = await db.from("profile").update({ title_key: key }).eq("user_id", user.id);
  if (error) throw error;
  refresh();
}

const SLUG = /^[a-z0-9][a-z0-9-]{2,23}$/;

export async function setPublicProfile(formData: FormData): Promise<{ error?: string }> {
  const user = await requireUser();
  const isPublic = formData.get("is_public") === "on";
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (isPublic && !SLUG.test(slug)) return { error: "Use 3-24 letters, numbers or dashes for the link name." };

  const { error } = await createClient()
    .from("profile")
    .update({ is_public: isPublic, public_slug: slug || null })
    .eq("user_id", user.id);
  if (error) return { error: error.code === "23505" ? "That link name is taken." : error.message };
  revalidatePath("/dashboard/settings");
  return {};
}
