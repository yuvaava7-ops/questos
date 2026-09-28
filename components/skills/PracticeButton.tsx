"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { addPracticeQuest } from "@/lib/actions";

// Adds a "Practice: <node>" quest for today, linked to the node so
// completing it trains that skill.
export function PracticeButton({ nodeId, nodeName, xp = 15 }: { nodeId: string; nodeName: string; xp?: number }) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={isPending || added}
      onClick={() =>
        startTransition(async () => {
          await addPracticeQuest(nodeId, nodeName, xp);
          setAdded(true);
        })
      }
      className="flex shrink-0 items-center gap-1 rounded-[6px] border border-gold/50 bg-black/40 px-3 py-1 font-display text-[12px] font-semibold text-gold transition-colors hover:border-gold hover:bg-black/60 disabled:opacity-60"
    >
      {added ? <Check size={12} /> : <Plus size={12} />}
      {added ? "Added to today" : isPending ? "Adding..." : "Practice"}
    </button>
  );
}
