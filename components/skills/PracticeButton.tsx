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
      className="flex shrink-0 items-center gap-1 rounded-[8px] border border-gold/30 px-2.5 py-1 text-[11.5px] font-medium text-gold transition-colors hover:bg-gold/10 disabled:opacity-60"
    >
      {added ? <Check size={12} /> : <Plus size={12} />}
      {added ? "Added to today" : isPending ? "Adding..." : "Practice"}
    </button>
  );
}
