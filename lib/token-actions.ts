"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { generateApiToken, hashApiToken } from "@/lib/api-tokens";

// Returns the plain token exactly once; only its hash is stored.
export async function createApiToken(formData: FormData): Promise<{ token?: string; error?: string }> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60) || "Claude";
  const token = generateApiToken();
  const { error } = await createClient()
    .from("api_tokens")
    .insert({ user_id: user.id, name, token_hash: hashApiToken(token) });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { token };
}

export async function revokeApiToken(id: string) {
  const user = await requireUser();
  const { error } = await createClient().from("api_tokens").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/dashboard/settings");
}
