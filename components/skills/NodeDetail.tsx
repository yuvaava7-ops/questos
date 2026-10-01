import type { Accent, SkillNodeView } from "@/lib/types";
import { ACCENT } from "@/components/pixel/accent";
import { SegBar } from "@/components/pixel/SegBar";
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

// Perk readout along the bottom of the constellation, like Skyrim's.
export function NodeDetail({ node, nameById, accent }: { node: SkillNodeView; nameById: Map<string, string>; accent: Accent }) {
  const lockedBy = node.prerequisites.map((id) => nameById.get(id) ?? "Unknown");
  const facts: [string, string][] = [
    ["Requires", lockedBy.length > 0 ? lockedBy.join(", ") : "Nothing (root perk)"],
    ["Last practiced", node.lastPracticedAt ? daysAgo(node.lastPracticedAt) : "Never"],
    ["Upkeep", node.maintenanceDays ? `Every ${node.maintenanceDays} days` : "None needed"],
  ];

  return (
    <div className="border-t-4 border-gold bg-ink/90 p-4 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:p-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="px-title break-words text-[14px] leading-snug text-gold">{node.name}</h2>
          <span className={`px-title px-1.5 py-1 text-[8px] ${STATE_BADGE[node.state]}`}>{node.state}</span>
        </div>
        {node.description && <p className="mt-3 text-[24px] leading-tight text-paper">{node.description}</p>}

        {node.state === "locked" && (
          <p className="mt-3 text-[21px] leading-tight text-faint">
            Locked until its prerequisites are complete. Practice still counts: XP earned now is kept.
          </p>
        )}
        {node.state === "rusty" && (
          <p className="mt-3 text-[21px] leading-tight text-ember">
            Not practiced in over {node.maintenanceDays} days. Your XP is kept; a practice session clears the rust.
          </p>
        )}
      </div>

      <div className="mt-4 lg:mt-0">
        <SegBar
          fraction={node.xp / node.xpRequired}
          color={node.state === "rusty" ? "ember" : ACCENT[accent].bar}
          label={`${node.name} XP`}
        />
        <div className="mt-1.5 flex items-center justify-between text-[22px] leading-none text-dim">
          <span>
            {node.xp} / {node.xpRequired} XP
          </span>
          <PracticeButton key={node.id} nodeId={node.id} nodeName={node.name} />
        </div>

        <dl className="mt-4 flex flex-col gap-2 text-[21px] leading-tight">
          {facts.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-t-2 border-dusk pt-2">
              <dt className="shrink-0 uppercase text-faint">{k}</dt>
              <dd className="text-right text-paper">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
