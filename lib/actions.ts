"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function toggleQuest(id: string, done: boolean) {
  const { error } = await supabase
    .from("quests")
    .update({ done, completed_at: done ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
}

export async function addQuest(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const time = String(formData.get("time") ?? "").trim();
  const xp = Number(formData.get("xp")) || 10;

  const { error } = await supabase.from("quests").insert({
    label,
    time: time || null,
    xp,
    quest_date: todayISO(),
  });
  if (error) throw error;
  revalidatePath("/");
}

export async function deleteQuest(id: string) {
  const { error } = await supabase.from("quests").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
}

export async function toggleTask(id: string, done: boolean) {
  const { error } = await supabase.from("tasks").update({ done }).eq("id", id);
  if (error) throw error;
  revalidatePath("/");
}

export async function addTask(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const priority = String(formData.get("priority") ?? "medium");

  const { error } = await supabase.from("tasks").insert({ label, priority });
  if (error) throw error;
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
}
