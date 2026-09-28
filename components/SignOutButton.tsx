"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/auth-actions";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const text = isPending ? "Signing out..." : "Log out";

  return (
    <button
      type="button"
      onClick={() => startTransition(() => signOutAction())}
      disabled={isPending}
      aria-label={compact ? text : undefined}
      className={`flex items-center gap-2 rounded-[8px] text-[12.5px] font-medium text-text-faint transition-colors hover:text-text disabled:opacity-60 ${
        compact ? "p-2" : "mt-3 w-full px-1 py-1.5"
      }`}
    >
      <LogOut size={14} />
      {!compact && text}
    </button>
  );
}
