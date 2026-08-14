"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function toggleQuest(id: string, done: boolean) {
  const user = await requireUser();
  const supabase = createClient();
  const { error } = await supabase
    .from("quests")
    .update({ done, completed_at: done ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/");
}

export async function addQuest(formData: FormData) {
  const user = await requireUser();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const time = String(formData.get("time") ?? "").trim();
  const xp = Number(formData.get("xp")) || 10;

  const supabase = createClient();
  const { error } = await supabase.from("quests").insert({
    user_id: user.id,
    label,
    time: time || null,
    xp,
    quest_date: todayISO(),
  });
  if (error) throw error;
  revalidatePath("/");
}

export async function deleteQuest(id: string) {
  const user = await requireUser();
  const supabase = createClient();
  const { error } = await supabase.from("quests").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/");
}

export async function toggleTask(id: string, done: boolean) {
  const user = await requireUser();
  const supabase = createClient();
  const { error } = await supabase.from("tasks").update({ done }).eq("id", id).eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/");
}

export async function addTask(formData: FormData) {
  const user = await requireUser();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const priority = String(formData.get("priority") ?? "medium");

  const supabase = createClient();
  const { error } = await supabase.from("tasks").insert({ user_id: user.id, label, priority });
  if (error) throw error;
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  const user = await requireUser();
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/");
}
