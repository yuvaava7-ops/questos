"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTree } from "@/lib/actions";

export function DeleteTreeButton({ treeId, treeName }: { treeId: string; treeName: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Delete "${treeName}" and all its nodes? Earned XP stays in your total.`)) return;
        startTransition(async () => {
          await deleteTree(treeId);
          router.push("/dashboard/skills");
        });
      }}
      className="px-btn px-btn-ghost !px-3 !py-2.5 !text-[9px]"
    >
      {isPending ? "..." : "Delete tree"}
    </button>
  );
}
