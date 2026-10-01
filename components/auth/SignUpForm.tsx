"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUpAction } from "@/lib/auth-actions";
import { sfx } from "@/lib/sfx";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    sfx.tap();
    startTransition(async () => {
      const result = await signUpAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-[22px] uppercase text-dim">
        Hero name
        <input name="name" type="text" autoComplete="nickname" maxLength={24} placeholder="Your name" className="px-input" />
      </label>

      <label className="flex flex-col gap-2 text-[22px] uppercase text-dim">
        Email
        <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="px-input" />
      </label>

      <label className="flex flex-col gap-2 text-[22px] uppercase text-dim">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="6+ characters"
          className="px-input"
        />
      </label>

      {error && (
        <p role="alert" className="text-[22px] leading-tight text-ruby">
          ! {error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="px-btn mt-1 w-full">
        {isPending ? "Loading..." : "Start adventure"}
      </button>

      <p className="text-center text-[22px] text-dim">
        Already a hero?{" "}
        <Link href="/login" className="text-gold underline decoration-2 underline-offset-4">
          Continue
        </Link>
      </p>
    </form>
  );
}
