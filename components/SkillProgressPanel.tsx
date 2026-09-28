import type { SkillProgress } from "@/lib/types";
import { ACCENT_CLASSES } from "@/lib/theme";
import { Panel } from "@/components/Panel";
import { DynamicIcon } from "@/components/DynamicIcon";
import { ProgressBar } from "@/components/ProgressBar";

export function SkillProgressPanel({ skills }: { skills: SkillProgress[] }) {
  return (
    <Panel title="Skill Progress">
      {skills.length === 0 ? (
        <p className="py-2 text-[13px] text-text-faint">
          No skills tracked yet. Insert rows into <code>skills</code> in Supabase to see progress here.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {skills.map((skill) => {
            const accent = ACCENT_CLASSES[skill.color];
            return (
              <div key={skill.id} className={`rounded-[10px] border bg-panel2 p-4 ${accent.border}`}>
                <DynamicIcon name={skill.icon} size={17} strokeWidth={1.75} className={accent.text} />
                <div className="mt-2.5 truncate text-[13px] font-medium text-text">{skill.name}</div>
                <div className="mt-2">
                  <ProgressBar percent={skill.percent} barClassName={accent.bar} label={skill.name} />
                </div>
                <div className="mt-1.5 font-mono text-[11px] text-text-faint">{skill.percent}%</div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
