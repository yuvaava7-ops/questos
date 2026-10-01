import type { Accent, SkillNodeView } from "@/lib/types";
import { ACCENT } from "@/components/pixel/accent";
import { SegBar } from "@/components/pixel/SegBar";
import { Window } from "@/components/pixel/Window";
import { PracticeButton } from "@/components/skills/PracticeButton";

const STATE_BADGE = {
  locked: "bg-faint text-ink",
  available: "bg-gold text-ink",
  complete: "bg-leaf text-ink",
  rusty: "bg-ember text-ink",
} as const;

function daysAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export function NodeDetail({ node, nameById, accent }: { node: SkillNodeView; nameById: Map<string, string>; accent: Accent }) {
  const lockedBy = node.prerequisites.map((id) => nameById.get(id) ?? "Unknown");
  const facts: [string, string][] = [
    ["Requires", lockedBy.length > 0 ? lockedBy.join(", ") : "Nothing (root skill)"],
    ["Last practiced", node.lastPracticedAt ? daysAgo(node.lastPracticedAt) : "Never"],
    ["Upkeep", node.maintenanceDays ? `Every ${node.maintenanceDays} days` : "None needed"],
  ];

  return (
    <Window className="mt-7" bodyClassName="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="px-title break-words text-[12px] leading-snug">{node.name}</h2>
          <span className={`px-title mt-2 inline-block px-1.5 py-1 text-[8px] ${STATE_BADGE[node.state]}`}>{node.state}</span>
        </div>
        <PracticeButton key={node.id} nodeId={node.id} nodeName={node.name} />
      </div>

      {node.description && <p className="mt-3 text-[23px] leading-tight text-dim">{node.description}</p>}

      <div className="mt-4">
        <SegBar
          fraction={node.xp / node.xpRequired}
          color={node.state === "rusty" ? "ember" : ACCENT[accent].bar}
          label={`${node.name} XP`}
        />
        <p className="mt-1.5 text-[20px] leading-none text-faint">
          {node.xp} / {node.xpRequired} XP
        </p>
      </div>

      <dl className="mt-4 flex flex-col gap-2 text-[22px] leading-tight">
        {facts.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-t-2 border-dusk pt-2">
            <dt className="shrink-0 uppercase text-faint">{k}</dt>
            <dd className="text-right text-paper">{v}</dd>
          </div>
        ))}
      </dl>

      {node.state === "locked" && (
        <p className="mt-3 text-[20px] leading-tight text-faint">
          Locked until its prerequisites are complete. Practice still counts: XP earned now is kept.
        </p>
      )}
      {node.state === "rusty" && (
        <p className="mt-3 text-[20px] leading-tight text-ember">
          Not practiced in over {node.maintenanceDays} days. Your XP is kept; a practice session clears the rust.
        </p>
      )}
    </Window>
  );
}
