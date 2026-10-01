import { CLASS_THRESHOLD, STAT_KEYS, STATS, statLevel, type HeroClass, type StatXp } from "@/lib/stats";
import { SegBar } from "@/components/pixel/SegBar";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import type { Avatar } from "@/lib/avatar";
import { heroFrames } from "@/components/pixel/heroSprites";

const TEXT: Record<string, string> = {
  ruby: "text-ruby",
  sky: "text-sky",
  leaf: "text-leaf",
  grape: "text-grape",
  gold: "text-gold",
};

export function CharacterSheet({ heroClass, statXp, avatar }: { heroClass: HeroClass; statXp: StatXp; avatar: Avatar | null }) {
  const total = STAT_KEYS.reduce((s, k) => s + statXp[k], 0);
  const frames = heroFrames(heroClass.primary, avatar);

  return (
    <Window title="Character" className="mt-7">
      <div className="flex items-center gap-4">
        <div className="shrink-0 bg-ink p-1.5 shadow-[0_-3px_0_0_#ffd24a,0_3px_0_0_#ffd24a,-3px_0_0_0_#ffd24a,3px_0_0_0_#ffd24a]">
          <Sprite def={frames.a} scale={5} />
        </div>
        <div className="min-w-0">
          <p className="px-title break-words text-[14px] text-gold">{heroClass.name}</p>
          <p className="mt-1 text-[22px] leading-tight text-dim">{heroClass.blurb}</p>
        </div>
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        {STAT_KEYS.map((k) => {
          const s = STATS[k];
          const lv = statLevel(statXp[k]);
          return (
            <li key={k} title={s.blurb}>
              <div className="mb-1 flex items-baseline justify-between text-[24px] leading-none">
                <span className={`px-title text-[11px] ${TEXT[s.color]}`}>{s.abbr}</span>
                <span className="text-dim">{s.name}</span>
                <span className="text-paper">{lv.value}</span>
              </div>
              <SegBar fraction={lv.fraction} color={s.color} segments={16} label={`${s.name} progress`} />
            </li>
          );
        })}
      </ul>

      {total < CLASS_THRESHOLD && (
        <p className="mt-4 border-t-2 border-dusk pt-3 text-[21px] leading-tight text-faint">
          Tag quests with a stat. Earn {CLASS_THRESHOLD} stat XP to unlock your class.
        </p>
      )}
    </Window>
  );
}
