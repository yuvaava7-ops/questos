import type { SkillProgress } from "@/lib/types";
import { SegBar, type BarColor } from "@/components/pixel/SegBar";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { GEM } from "@/components/pixel/sprites";

const COLOR: Record<SkillProgress["color"], BarColor> = {
  green: "leaf",
  blue: "sky",
  purple: "grape",
  orange: "ember",
};

export function Skills({ skills }: { skills: SkillProgress[] }) {
  return (
    <Window title="Skills" className="mt-7">
      {skills.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-3 text-center">
          <Sprite def={GEM} scale={5} />
          <p className="text-[24px] text-dim">No skills discovered yet.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {skills.map((s) => (
            <li key={s.id}>
              <div className="mb-1.5 flex items-baseline justify-between text-[24px] leading-none">
                <span className="uppercase text-paper">{s.name}</span>
                <span className="text-dim">{s.percent}%</span>
              </div>
              <SegBar fraction={s.percent / 100} color={COLOR[s.color]} segments={20} label={`${s.name} progress`} />
            </li>
          ))}
        </ul>
      )}
    </Window>
  );
}
