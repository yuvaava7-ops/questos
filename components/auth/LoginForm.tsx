"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, Lock, LogIn } from "lucide-react";
import { signInAction } from "@/lib/auth-actions";
import { useBouncyPress } from "@/components/auth/use-bouncy-press";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const button = useBouncyPress<HTMLButtonElement>();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signInAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-text-dim">
        Email
        <div className="flex items-center gap-2 rounded-[8px] border border-border bg-panel2 px-3 py-2.5 focus-within:border-gold">
          <Mail size={15} className="shrink-0 text-text-faint" />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full bg-transparent text-[13.5px] text-text placeholder:text-text-faint focus:outline-none"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-text-dim">
        Password
        <div className="flex items-center gap-2 rounded-[8px] border border-border bg-panel2 px-3 py-2.5 focus-within:border-gold">
          <Lock size={15} className="shrink-0 text-text-faint" />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full bg-transparent text-[13.5px] text-text placeholder:text-text-faint focus:outline-none"
          />
        </div>
      </label>

      {error && <p className="text-[12.5px] text-[#f87171]">{error}</p>}

      <button
        ref={button.ref}
        onPointerDown={button.onPointerDown}
        type="submit"
        disabled={isPending}
        className="mt-1.5 flex items-center justify-center gap-2 rounded-[8px] bg-gold py-2.5 text-[13.5px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <LogIn size={15} />
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <p className="mt-1 text-center text-[13px] text-text-dim">
        No account yet?{" "}
        <Link href="/signup" className="font-semibold text-gold">
          Sign up
        </Link>
      </p>
    </form>
  );
}
