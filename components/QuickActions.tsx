"use client";

import { useState, useTransition } from "react";
import { Dumbbell } from "lucide-react";
import { adaptSize } from "@/icons/game/adapt-size";
import SwordBrandishSvg from "@/icons/game/delapouite/sword-brandish.svg";
import OpenBookSvg from "@/icons/game/lorc/open-book.svg";
import QuillSvg from "@/icons/game/lorc/quill.svg";
import { addQuest } from "@/lib/actions";
import { Panel } from "@/components/Panel";

const SwordBrandish = adaptSize(SwordBrandishSvg);
const OpenBook = adaptSize(OpenBookSvg);
const Quill = adaptSize(QuillSvg);

// "Add Quest" jumps to the real add-quest form (#today-quests) rather than
// instant-submitting a vaguely-labeled quest. The other three are specific
// enough recurring activities that a one-click instant log is genuinely
// useful, not junk data.
const INSTANT_PRESETS = [
  { label: "Log Workout", questLabel: "Workout", xp: 20, Icon: Dumbbell },
  { label: "Study Session", questLabel: "Study session", xp: 15, Icon: OpenBook },
  { label: "Write Journal", questLabel: "Journal entry", xp: 10, Icon: Quill },
];

export function QuickActions() {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState<string | null>(null);

  function handleClick(label: string, questLabel: string, xp: number) {
    const formData = new FormData();
    formData.set("label", questLabel);
    formData.set("xp", String(xp));
    setActive(label);
    startTransition(() => addQuest(formData));
  }

  const tileClass =
    "flex flex-col items-center gap-2 rounded-[10px] border border-border/60 bg-panel2 px-2 py-4 text-center transition-colors hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:opacity-60";

  return (
    <Panel title="Quick Log">
      <div className="grid grid-cols-2 gap-3">
        <a href="#today-quests" className={tileClass}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold">
            <SwordBrandish size={16} />
          </span>
          <span className="text-[11.5px] font-medium text-text-dim">Add Quest</span>
        </a>
        {INSTANT_PRESETS.map(({ label, questLabel, xp, Icon }) => (
          <button key={label} type="button" onClick={() => handleClick(label, questLabel, xp)} disabled={isPending} className={tileClass}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold">
              <Icon size={16} />
            </span>
            <span className="text-[11.5px] font-medium text-text-dim">
              {isPending && active === label ? "Logging..." : label}
            </span>
            <span className="font-mono text-[10px] text-text-faint">+{xp} XP</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
