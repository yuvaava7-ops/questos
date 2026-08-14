"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUpAction(formData: FormData): Promise<{ error?: string } | undefined> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: name ? { name } : undefined },
  });
  if (error) return { error: error.message };

  // Requires "Confirm email" to be turned off in Supabase Auth settings —
  // otherwise signUp() succeeds but returns no session yet.
  if (!data.session) {
    return { error: "Account created, but no session came back — check that Confirm email is off in Supabase Auth settings." };
  }

  redirect("/dashboard");
}

export async function signInAction(formData: FormData): Promise<{ error?: string } | undefined> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}
