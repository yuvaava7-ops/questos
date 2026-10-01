"use client";

import { useState, useTransition } from "react";
import { addPracticeQuest } from "@/lib/actions";
import { sfx } from "@/lib/sfx";

// Adds a "Practice: <node>" quest for today, linked to the node so
// completing it trains that skill.
export function PracticeButton({ nodeId, nodeName, xp = 15 }: { nodeId: string; nodeName: string; xp?: number }) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={isPending || added}
      onClick={() => {
        sfx.tap();
        startTransition(async () => {
          await addPracticeQuest(nodeId, nodeName, xp);
          setAdded(true);
        });
      }}
      className="px-btn !px-3 !py-2.5 !text-[9px]"
    >
      {added ? "Added" : isPending ? "..." : "Practice"}
    </button>
  );
}
