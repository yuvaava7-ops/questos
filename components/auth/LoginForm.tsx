"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, Lock, LogIn } from "lucide-react";
import { signInAction } from "@/lib/auth-actions";
import { PRIMARY_BUTTON_CLASS } from "@/lib/theme";
import { useBouncyPress } from "@/components/auth/use-bouncy-press";
import { AuthField } from "@/components/auth/AuthField";

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
      <AuthField label="Email" icon={Mail} name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
      <AuthField
        label="Password"
        icon={Lock}
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="••••••••"
      />

      {error && (
        <p role="alert" className="text-[12.5px] text-red">
          {error}
        </p>
      )}

      <button
        ref={button.ref}
        onPointerDown={button.onPointerDown}
        type="submit"
        disabled={isPending}
        className={`${PRIMARY_BUTTON_CLASS} mt-1.5 flex items-center justify-center gap-2 py-2.5 text-[13.5px]`}
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
