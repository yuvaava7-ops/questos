"use client";

import { useTransition } from "react";
import { Dumbbell } from "lucide-react";
import { adaptSize } from "@/icons/game/adapt-size";
import SwordBrandishSvg from "@/icons/game/delapouite/sword-brandish.svg";
import OpenBookSvg from "@/icons/game/lorc/open-book.svg";
import QuillSvg from "@/icons/game/lorc/quill.svg";
import { addQuest } from "@/lib/actions";
import { SectionHeading } from "@/components/SectionHeading";

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

  function handleClick(questLabel: string, xp: number) {
    const formData = new FormData();
    formData.set("label", questLabel);
    formData.set("xp", String(xp));
    startTransition(() => addQuest(formData));
  }

  return (
    <div className="rounded-card border border-border/60 bg-panel p-6">
      <SectionHeading title="Quick Actions" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <a
          href="#today-quests"
          className="flex flex-col items-center gap-2 rounded-[10px] border border-border/60 bg-panel2 py-4 text-center transition-colors hover:border-gold/40"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold">
            <SwordBrandish size={16} />
          </span>
          <span className="text-[11.5px] font-medium text-text-dim">Add Quest</span>
        </a>
        {INSTANT_PRESETS.map(({ label, questLabel, xp, Icon }) => (
          <button
            key={label}
            onClick={() => handleClick(questLabel, xp)}
            disabled={isPending}
            className="flex flex-col items-center gap-2 rounded-[10px] border border-border/60 bg-panel2 py-4 text-center transition-colors hover:border-gold/40 disabled:opacity-60"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold">
              <Icon size={16} />
            </span>
            <span className="text-[11.5px] font-medium text-text-dim">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
