"use client";

import { useTransition } from "react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { equipTitle } from "@/lib/game-actions";
import { sfx } from "@/lib/sfx";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { STAR } from "@/components/pixel/sprites";

// Achievements. Unlocked ones can be worn as a title on your character card.
export function Trophies({ unlockedKeys, titleKey }: { unlockedKeys: string[]; titleKey: string | null }) {
  const [isPending, startTransition] = useTransition();
  const unlocked = new Set(unlockedKeys);

  return (
    <Window title="Trophies" right={`${unlocked.size}/${ACHIEVEMENTS.length}`} className="mt-7">
      <ul className="flex flex-col">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.key);
          const worn = titleKey === a.key;
          return (
            <li key={a.key} className={`flex min-h-[48px] items-center gap-3 border-b-2 border-dusk/70 py-1.5 last:border-b-0 ${got ? "" : "opacity-45"}`}>
              <span className={got ? "" : "grayscale"}>
                <Sprite def={STAR} scale={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-[24px] leading-none ${got ? "text-gold" : "text-paper"}`}>{a.name}</p>
                <p className="mt-1 text-[19px] leading-tight text-dim">
                  {a.description} {got ? "" : `+${a.reward} XP`}
                </p>
              </div>
              {got && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    sfx.tap();
                    startTransition(() => equipTitle(worn ? null : a.key));
                  }}
                  className={`px-btn !px-2 !py-2 !text-[8px] ${worn ? "" : "px-btn-ghost"}`}
                >
                  {worn ? "Worn" : "Wear"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </Window>
  );
}
