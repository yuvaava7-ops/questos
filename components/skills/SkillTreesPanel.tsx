import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import type { SkillTreeView } from "@/lib/types";
import { ACCENT_CLASSES } from "@/lib/theme";
import { Panel } from "@/components/Panel";
import { ProgressBar } from "@/components/ProgressBar";
import { DynamicIcon } from "@/components/DynamicIcon";
import { PracticeButton } from "@/components/skills/PracticeButton";

const MAX_RUSTY_SHOWN = 5;

export function SkillTreesPanel({ trees }: { trees: SkillTreeView[] }) {
  const rusty = trees.flatMap((t) => t.nodes.filter((n) => n.state === "rusty").map((n) => ({ ...n, treeName: t.name })));

  return (
    <Panel
      title="Skill Trees"
      action={
        trees.length > 0 && (
          <Link href="/dashboard/skills" className="flex items-center gap-0.5 text-[12px] font-medium text-text-faint hover:text-gold">
            View all <ChevronRight size={13} />
          </Link>
        )
      }
    >
      {trees.length === 0 ? (
        <div className="flex flex-col items-start gap-2 py-1 text-[13px] text-text-faint">
          <p>No skill trees yet. Ask Claude to build one for a skill you want to learn or keep sharp.</p>
          <Link href="/dashboard/settings" className="flex items-center gap-1.5 font-medium text-gold hover:underline">
            <Sparkles size={13} /> Connect Claude
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trees.map((tree) => {
            const accent = ACCENT_CLASSES[tree.color];
            return (
              <Link
                key={tree.id}
                href={`/dashboard/skills/${tree.id}`}
                className={`rounded-[10px] border bg-panel2 p-4 transition-colors hover:bg-panel2/70 ${accent.border}`}
              >
                <div className="flex items-center gap-2">
                  <DynamicIcon name={tree.icon} size={16} strokeWidth={1.75} className={accent.text} />
                  <span className="truncate text-[13px] font-medium text-text">{tree.name}</span>
                </div>
                <div className="mt-3">
                  <ProgressBar percent={tree.percent} barClassName={accent.bar} label={`${tree.name} progress`} />
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[11px] text-text-faint">
                  <span>
                    {tree.completeCount}/{tree.nodes.length} nodes
                  </span>
                  {tree.rustyCount > 0 && <span className="text-orange">{tree.rustyCount} rusty</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {rusty.length > 0 && (
        <div className="mt-5 border-t border-border/60 pt-4">
          <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-orange">Needs practice</h3>
          <ul className="flex flex-col gap-2">
            {rusty.slice(0, MAX_RUSTY_SHOWN).map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="min-w-0 truncate text-text-dim">
                  {n.name} <span className="text-text-faint">· {n.treeName}</span>
                </span>
                <PracticeButton nodeId={n.id} nodeName={n.name} />
              </li>
            ))}
          </ul>
          {rusty.length > MAX_RUSTY_SHOWN && (
            <p className="mt-2 text-[12px] text-text-faint">+{rusty.length - MAX_RUSTY_SHOWN} more in your skill trees.</p>
          )}
        </div>
      )}
    </Panel>
  );
}
