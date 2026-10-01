"use server";

import { revalidatePath } from "next/cache";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { assertOwnsNode, awardXp, deleteSkillTree, revokeQuestXp } from "@/lib/skill-data";
import { isStatKey } from "@/lib/stats";
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
  // "layout" so /dashboard/skills/* re-render too.
  revalidatePath("/dashboard", "layout");
}

function readLabel(formData: FormData): string {
  return String(formData.get("label") ?? "").trim().slice(0, MAX_LABEL);
}

// Completing a quest writes its XP to the ledger (and to its skill node, if
// linked); un-completing removes that ledger row again.
export async function toggleQuest(id: string, done: boolean) {
  const user = await requireUser();
  const db = createClient();
  const { data: quest, error } = await db
    .from("quests")
    .update({ done, completed_at: done ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, xp, skill_node_id")
    .maybeSingle();
  if (error) throw error;
  if (quest) {
    if (done) {
      await awardXp(db, user.id, { amount: quest.xp, source: "quest", questId: quest.id, skillNodeId: quest.skill_node_id });
    } else {
      await revokeQuestXp(db, user.id, quest.id);
    }
  }
  revalidatePath("/dashboard", "layout");
}

export async function addQuest(formData: FormData) {
  const label = readLabel(formData);
  if (!label) return;
  const time = String(formData.get("time") ?? "").trim().slice(0, 20);
  const rawXp = Math.round(Number(formData.get("xp")));
  const xp = Number.isFinite(rawXp) && rawXp > 0 ? Math.min(rawXp, MAX_XP) : 10;
  const skillNodeId = String(formData.get("skill_node_id") ?? "") || null;
  const rawStat = String(formData.get("stat") ?? "");
  const stat = isStatKey(rawStat) ? rawStat : null;

  await mutate(async (db, userId) => {
    if (skillNodeId) await assertOwnsNode(db, userId, skillNodeId);
    return db
      .from("quests")
      .insert({ user_id: userId, label, time: time || null, xp, quest_date: todayISO(), skill_node_id: skillNodeId, ...(stat ? { stat } : {}) });
  });
}

// "Practice" button on a skill node: adds a quest for today that trains it.
export async function addPracticeQuest(nodeId: string, nodeName: string, xp: number) {
  const formData = new FormData();
  formData.set("label", `Practice: ${nodeName}`);
  formData.set("xp", String(xp));
  formData.set("skill_node_id", nodeId);
  await addQuest(formData);
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

export async function deleteTree(treeId: string) {
  const user = await requireUser();
  await deleteSkillTree(createClient(), user.id, treeId);
  revalidatePath("/dashboard", "layout");
}
