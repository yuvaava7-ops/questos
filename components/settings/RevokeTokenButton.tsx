"use client";

import { useTransition } from "react";
import { revokeApiToken } from "@/lib/token-actions";

export function RevokeTokenButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(`Revoke "${name}"? Anything using it loses access immediately.`)) {
          startTransition(() => revokeApiToken(id));
        }
      }}
      className="text-[12px] font-medium text-text-faint transition-colors hover:text-red disabled:opacity-60"
    >
      {isPending ? "Revoking..." : "Revoke"}
    </button>
  );
}
