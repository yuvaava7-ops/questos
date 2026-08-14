"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/auth-actions";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <form action={() => startTransition(() => signOutAction())}>
      <button
        type="submit"
        disabled={isPending}
        aria-label="Sign out"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-text-faint transition-colors hover:bg-panel2 hover:text-text disabled:opacity-60"
      >
        <LogOut size={15} />
      </button>
    </form>
  );
}
