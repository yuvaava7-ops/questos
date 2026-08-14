"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/auth-actions";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <form action={() => startTransition(() => signOutAction())} className="mt-3">
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center gap-2 rounded-[8px] px-1 py-1.5 text-[12.5px] font-medium text-text-faint transition-colors hover:text-text disabled:opacity-60"
      >
        <LogOut size={14} />
        {isPending ? "Signing out..." : "Log out"}
      </button>
    </form>
  );
}
