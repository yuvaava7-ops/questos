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
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-[14.5px] font-bold">Skill Progress</h3>
      </div>
      {skills.length === 0 && (
        <p className="py-2 text-[13px] text-text-faint">
          No skills tracked yet — insert rows into <code>skills</code> in Supabase to see progress here.
        </p>
      )}
      {skills.map((skill) => {
        const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[skill.icon] ?? Icons.Circle;
        return (
          <div key={skill.id} className="mb-3.5 last:mb-0">
            <div className="mb-1.5 flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2 font-semibold">
                <Icon size={14} />
                {skill.name}
              </div>
              <span className="font-mono text-xs text-text-dim">{skill.percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#1c2233]">
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
