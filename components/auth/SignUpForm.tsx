"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { signUpAction } from "@/lib/auth-actions";
import { useBouncyPress } from "@/components/auth/use-bouncy-press";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const button = useBouncyPress<HTMLButtonElement>();

  useEffect(() => {
    if (!formRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fields = formRef.current.querySelectorAll<HTMLElement>("[data-animate]");
    animate(fields, {
      opacity: [0, 1],
      translateY: reduced ? 0 : [24, 0],
      scale: reduced ? 1 : [0.94, 1],
      delay: reduced ? 0 : stagger(90, { start: 100 }),
      duration: reduced ? 1 : 700,
      ease: "outElastic(1, .6)",
    });
  }, []);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUpAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3.5">
      <label data-animate className="flex flex-col gap-1.5 text-[13px] font-medium text-text-dim opacity-0">
        Name
        <div className="flex items-center gap-2 rounded-[8px] border border-border bg-panel2 px-3 py-2.5 focus-within:border-purple">
          <User size={15} className="shrink-0 text-text-faint" />
          <input
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className="w-full bg-transparent text-[13.5px] text-text placeholder:text-text-faint focus:outline-none"
          />
        </div>
      </label>

      <label data-animate className="flex flex-col gap-1.5 text-[13px] font-medium text-text-dim opacity-0">
        Email
        <div className="flex items-center gap-2 rounded-[8px] border border-border bg-panel2 px-3 py-2.5 focus-within:border-purple">
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

      <label data-animate className="flex flex-col gap-1.5 text-[13px] font-medium text-text-dim opacity-0">
        Password
        <div className="flex items-center gap-2 rounded-[8px] border border-border bg-panel2 px-3 py-2.5 focus-within:border-purple">
          <Lock size={15} className="shrink-0 text-text-faint" />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className="w-full bg-transparent text-[13.5px] text-text placeholder:text-text-faint focus:outline-none"
          />
        </div>
      </label>

      {error && <p className="text-[12.5px] text-[#f87171]">{error}</p>}

      <div data-animate className="mt-1.5 opacity-0">
        <button
          ref={button.ref}
          onPointerDown={button.onPointerDown}
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-purple to-blue py-2.5 text-[13.5px] font-semibold text-bg transition-opacity disabled:opacity-60"
        >
          <UserPlus size={15} />
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </div>

      <p data-animate className="mt-1 text-center text-[13px] text-text-dim opacity-0">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-purple">
          Sign in
        </Link>
      </p>
    </form>
  );
}
