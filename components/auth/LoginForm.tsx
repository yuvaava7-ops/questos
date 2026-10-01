"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signInAction } from "@/lib/auth-actions";
import { sfx } from "@/lib/sfx";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    sfx.tap();
    startTransition(async () => {
      const result = await signInAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-[22px] uppercase text-dim">
        Email
        <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="px-input" />
      </label>

      <label className="flex flex-col gap-2 text-[22px] uppercase text-dim">
        Password
        <input name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className="px-input" />
      </label>

      {error && (
        <p role="alert" className="text-[22px] leading-tight text-ruby">
          ! {error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="px-btn mt-1 w-full">
        {isPending ? "Loading..." : "Continue"}
      </button>

      <p className="text-center text-[22px] text-dim">
        No save file?{" "}
        <Link href="/signup" className="text-gold underline decoration-2 underline-offset-4">
          New game
        </Link>
      </p>
    </form>
  );
}
