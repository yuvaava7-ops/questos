"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteTree } from "@/lib/actions";

export function DeleteTreeButton({ treeId, treeName }: { treeId: string; treeName: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Delete "${treeName}" and all its nodes? XP you've earned stays in your total.`)) return;
        startTransition(async () => {
          await deleteTree(treeId);
          router.push("/dashboard/skills");
        });
      }}
      className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-red disabled:opacity-60"
    >
      <Trash2 size={13} />
      {isPending ? "Deleting..." : "Delete tree"}
    </button>
  );
}
