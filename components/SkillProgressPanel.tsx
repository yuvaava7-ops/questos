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
    <div className="rounded-card border border-border/60 bg-panel p-6">
      <h3 className="mb-5 text-[15px] font-semibold tracking-tight">Skill Progress</h3>
      {skills.length === 0 && (
        <p className="py-2 text-[13px] text-text-faint">
          No skills tracked yet — insert rows into <code>skills</code> in Supabase to see progress here.
        </p>
      )}
      {skills.map((skill) => {
        const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[skill.icon] ?? Icons.Circle;
        return (
          <div key={skill.id} className="mb-4 last:mb-0">
            <div className="mb-2 flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2 font-medium text-text-dim">
                <Icon size={15} strokeWidth={1.75} className="text-text-faint" />
                {skill.name}
              </div>
              <span className="font-mono text-[12px] text-text-faint">{skill.percent}%</span>
            </div>
            <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
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
