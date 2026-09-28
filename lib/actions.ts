"use server";

import { revalidatePath } from "next/cache";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import type { Task } from "@/lib/types";

const PRIORITIES: readonly Task["priority"][] = ["high", "medium", "low"];
const MAX_LABEL = 200;
const MAX_XP = 1000;

// Every mutation: resolve the user, run one scoped query, surface errors to
// the error boundary, then refresh the dashboard.
async function mutate(
  op: (supabase: SupabaseClient, userId: string) => PromiseLike<{ error: PostgrestError | null }>
) {
  const user = await requireUser();
  const { error } = await op(createClient(), user.id);
  if (error) throw error;
  revalidatePath("/dashboard");
}

function readLabel(formData: FormData): string {
  return String(formData.get("label") ?? "").trim().slice(0, MAX_LABEL);
}

export async function toggleQuest(id: string, done: boolean) {
  await mutate((db, userId) =>
    db
      .from("quests")
      .update({ done, completed_at: done ? new Date().toISOString() : null })
      .eq("id", id)
      .eq("user_id", userId)
  );
}

export async function addQuest(formData: FormData) {
  const label = readLabel(formData);
  if (!label) return;
  const time = String(formData.get("time") ?? "").trim().slice(0, 20);
  const rawXp = Math.round(Number(formData.get("xp")));
  const xp = Number.isFinite(rawXp) && rawXp > 0 ? Math.min(rawXp, MAX_XP) : 10;

  await mutate((db, userId) =>
    db.from("quests").insert({ user_id: userId, label, time: time || null, xp, quest_date: todayISO() })
  );
}

export async function deleteQuest(id: string) {
  await mutate((db, userId) => db.from("quests").delete().eq("id", id).eq("user_id", userId));
}

export async function toggleTask(id: string, done: boolean) {
  await mutate((db, userId) => db.from("tasks").update({ done }).eq("id", id).eq("user_id", userId));
}

export async function addTask(formData: FormData) {
  const label = readLabel(formData);
  if (!label) return;
  const raw = String(formData.get("priority") ?? "medium");
  const priority = PRIORITIES.find((p) => p === raw) ?? "medium";

  await mutate((db, userId) => db.from("tasks").insert({ user_id: userId, label, priority }));
}

export async function deleteTask(id: string) {
  await mutate((db, userId) => db.from("tasks").delete().eq("id", id).eq("user_id", userId));
}
