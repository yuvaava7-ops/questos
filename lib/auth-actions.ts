"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// NEXT_PUBLIC_SITE_URL wins if set (needed for a custom domain). Otherwise
// fall back to Vercel's auto-provided deployment URL rather than localhost,
// so confirmation links don't silently break on a deploy that forgot to set it.
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function signUpAction(formData: FormData): Promise<{ error?: string } | undefined> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = createClient();
  const siteUrl = getSiteUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined,
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  if (data.session) {
    redirect("/dashboard");
  }
  redirect("/login?message=check-email");
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
