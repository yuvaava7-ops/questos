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
      className="px-btn px-btn-ghost !px-3 !py-2.5 !text-[9px]"
    >
      {isPending ? "..." : "Revoke"}
    </button>
  );
}
