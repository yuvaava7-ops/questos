import * as Icons from "lucide-react";
import type { SkillProgress } from "@/lib/types";

const COLOR_MAP = {
  green: "bg-green",
  blue: "bg-blue",
  orange: "bg-orange",
  purple: "bg-purple",
} as const;

export function SkillProgressPanel({ skills }: { skills: SkillProgress[] }) {
  return (
    <div className="rounded-card border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold">Skill Progress</h3>
      </div>
      {skills.length === 0 && (
        <p className="py-2 text-[13px] text-text-faint">
          No skills tracked yet — insert rows into <code>skills</code> in Supabase to see progress here.
        </p>
      )}
      {skills.map((skill) => {
        const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[skill.icon] ?? Icons.Circle;
        return (
          <div key={skill.id} className="mb-4 last:mb-0">
            <div className="mb-2 flex items-center justify-between text-[13.5px]">
              <div className="flex items-center gap-2 font-semibold">
                <Icon size={15} />
                {skill.name}
              </div>
              <span className="font-mono text-[12.5px] font-semibold text-text-dim">{skill.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#1c2233]">
              <div
                className={`h-full rounded-full ${COLOR_MAP[skill.color]}`}
                style={{ width: `${skill.percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
