import Link from "next/link";
import type { SkillTreeView } from "@/lib/types";
import { ACCENT } from "@/components/pixel/accent";
import { AccentGem } from "@/components/pixel/AccentGem";
import { SegBar } from "@/components/pixel/SegBar";
import { Sprite } from "@/components/pixel/Sprite";
import { Window } from "@/components/pixel/Window";
import { GEM, HOURGLASS } from "@/components/pixel/sprites";
import { PracticeButton } from "@/components/skills/PracticeButton";

const MAX_RUSTY_SHOWN = 4;

export function TreeCard({ tree }: { tree: SkillTreeView }) {
  const a = ACCENT[tree.color];
  return (
    <Link
      href={`/dashboard/skills/${tree.id}`}
      className="block bg-ink/60 p-3 shadow-[0_-3px_0_0_#0b0820,0_3px_0_0_#0b0820,-3px_0_0_0_#0b0820,3px_0_0_0_#0b0820] active:translate-y-[2px]"
    >
      <div className="flex items-center gap-3">
        <AccentGem accent={tree.color} scale={3} />
        <span className="min-w-0 flex-1 truncate text-[26px] uppercase leading-none text-paper">{tree.name}</span>
        <span className={`px-title text-[11px] ${a.text}`}>{tree.percent}%</span>
      </div>
      <div className="mt-2.5">
        <SegBar fraction={tree.percent / 100} color={a.bar} label={`${tree.name} progress`} />
      </div>
      <div className="mt-2 flex justify-between text-[20px] leading-none text-faint">
        <span>
          {tree.completeCount}/{tree.nodes.length} nodes
        </span>
        {tree.rustyCount > 0 && <span className="text-ember">{tree.rustyCount} rusty</span>}
      </div>
    </Link>
  );
}

export function EmptyTrees() {
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <Sprite def={GEM} scale={5} />
      <p className="text-[24px] leading-tight text-dim">
        No skill trees yet. Connect an AI in Camp, then ask it to build you a skill tree for something you want to learn.
      </p>
      <Link href="/dashboard/settings" className="px-btn">
        Open camp
      </Link>
    </div>
  );
}

export function SkillTreesPanel({ trees }: { trees: SkillTreeView[] }) {
  const rusty = trees.flatMap((t) => t.nodes.filter((n) => n.state === "rusty").map((n) => ({ ...n, treeName: t.name })));

  return (
    <Window
      title="Skill Trees"
      right={
        trees.length > 0 ? (
          <Link href="/dashboard/skills" className="text-gold">
            all &gt;
          </Link>
        ) : undefined
      }
      className="mt-7"
    >
      {trees.length === 0 ? (
        <EmptyTrees />
      ) : (
        <div className="flex flex-col gap-4">
          {trees.map((t) => (
            <TreeCard key={t.id} tree={t} />
          ))}
        </div>
      )}

      {rusty.length > 0 && (
        <div className="mt-5 border-t-2 border-dusk pt-4">
          <h3 className="px-title mb-3 flex items-center gap-2 text-[10px] text-ember">
            <Sprite def={HOURGLASS} scale={2} /> Needs practice
          </h3>
          <ul className="flex flex-col gap-3">
            {rusty.slice(0, MAX_RUSTY_SHOWN).map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-[24px] leading-none text-paper">
                  {n.name} <span className="text-faint">· {n.treeName}</span>
                </span>
                <PracticeButton nodeId={n.id} nodeName={n.name} />
              </li>
            ))}
          </ul>
          {rusty.length > MAX_RUSTY_SHOWN && (
            <p className="mt-2 text-[20px] text-faint">+{rusty.length - MAX_RUSTY_SHOWN} more in your trees.</p>
          )}
        </div>
      )}
    </Window>
  );
}
