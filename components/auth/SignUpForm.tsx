"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { signUpAction } from "@/lib/auth-actions";
import { PRIMARY_BUTTON_CLASS } from "@/lib/theme";
import { useBouncyPress } from "@/components/auth/use-bouncy-press";
import { AuthField } from "@/components/auth/AuthField";

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
      <AuthField animate label="Name" icon={User} name="name" type="text" autoComplete="name" placeholder="Your name" />
      <AuthField animate label="Email" icon={Mail} name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
      <AuthField
        animate
        label="Password"
        icon={Lock}
        name="password"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        placeholder="At least 6 characters"
      />

      {error && (
        <p role="alert" className="text-[12.5px] text-red">
          {error}
        </p>
      )}

      <div data-animate className="mt-1.5 opacity-0">
        <button
          ref={button.ref}
          onPointerDown={button.onPointerDown}
          type="submit"
          disabled={isPending}
          className={`${PRIMARY_BUTTON_CLASS} flex w-full items-center justify-center gap-2 py-1.5 text-[15px]`}
        >
          <UserPlus size={15} />
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </div>

      <p data-animate className="mt-1 text-center text-[13px] text-text-dim opacity-0">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-gold">
          Sign in
        </Link>
      </p>
    </form>
  );
}
