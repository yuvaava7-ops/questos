import * as Icons from "lucide-react";
import type { SkillProgress } from "@/lib/types";
import { SectionHeading } from "@/components/SectionHeading";
import { GAME_ICONS } from "@/icons/game";

const COLOR_MAP = {
  green: "bg-green",
  blue: "bg-blue",
  orange: "bg-orange",
  purple: "bg-purple",
} as const;

const BORDER_COLOR_MAP = {
  green: "border-green/30",
  blue: "border-blue/30",
  orange: "border-orange/30",
  purple: "border-purple/30",
} as const;

const TEXT_COLOR_MAP = {
  green: "text-green",
  blue: "text-blue",
  orange: "text-orange",
  purple: "text-purple",
} as const;

export function SkillProgressPanel({ skills }: { skills: SkillProgress[] }) {
  return (
    <div className="rounded-card border border-border/60 bg-panel p-6">
      <SectionHeading title="Skill Progress" />
      {skills.length === 0 && (
        <p className="py-2 text-[13px] text-text-faint">
          No skills tracked yet — insert rows into <code>skills</code> in Supabase to see progress here.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {skills.map((skill) => {
          const Icon =
            GAME_ICONS[skill.icon] ?? (Icons as unknown as Record<string, Icons.LucideIcon>)[skill.icon] ?? Icons.Circle;
          return (
            <div key={skill.id} className={`rounded-[10px] border bg-panel2 p-4 ${BORDER_COLOR_MAP[skill.color]}`}>
              <Icon size={17} strokeWidth={1.75} className={TEXT_COLOR_MAP[skill.color]} />
              <div className="mt-2.5 text-[13px] font-medium text-text">{skill.name}</div>
              <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full ${COLOR_MAP[skill.color]}`}
                  style={{ width: `${skill.percent}%` }}
                />
              </div>
              <div className="mt-1.5 font-mono text-[11px] text-text-faint">{skill.percent}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
