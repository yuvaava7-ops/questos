import type { Accent, SkillNodeView } from "@/lib/types";
import { ACCENT_CLASSES } from "@/lib/theme";
import { Panel } from "@/components/Panel";
import { ProgressBar } from "@/components/ProgressBar";
import { PracticeButton } from "@/components/skills/PracticeButton";

const STATE_BADGE = {
  locked: "border-border bg-white/[0.03] text-text-faint",
  available: "border-gold/40 bg-gold/10 text-gold",
  complete: "border-green/40 bg-green-dim text-green",
  rusty: "border-orange/40 bg-orange-dim text-orange",
} as const;

function daysAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  return days === 1 ? "yesterday" : `${days} days ago`;
}

// Rendered inside the client-side SkillTreeGraph, so the icon arrives
// pre-rendered from the server (keeps the full icon set out of the bundle).
export function NodeDetail({
  node,
  nameById,
  accent,
  icon,
}: {
  node: SkillNodeView;
  nameById: Map<string, string>;
  accent: Accent;
  icon: React.ReactNode;
}) {
  const lockedBy = node.prerequisites.map((id) => nameById.get(id) ?? "Unknown");

  return (
    <Panel variant="parchment">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={ACCENT_CLASSES[accent].text}>{icon}</span>
          <h2 className="font-display text-[16px] font-semibold tracking-wide">{node.name}</h2>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATE_BADGE[node.state]}`}>
            {node.state}
          </span>
        </div>
        <PracticeButton key={node.id} nodeId={node.id} nodeName={node.name} />
      </div>

      {node.description && <p className="mt-3 text-[13px] leading-relaxed text-text-dim">{node.description}</p>}

      <div className="mt-4 max-w-md">
        <ProgressBar
          percent={(node.xp / node.xpRequired) * 100}
          tone={node.state === "rusty" ? "orange" : accent}
          label={`${node.name} XP`}
        />
        <div className="mt-1.5 font-display text-[11px] text-text-faint">
          {node.xp} / {node.xpRequired} XP
        </div>
      </div>

      <dl className="mt-5 grid gap-2.5 text-[12.5px] sm:grid-cols-3">
        <div className="tile px-3 py-2.5">
          <dt className="text-[11px] uppercase tracking-wide text-text-faint">Requires</dt>
          <dd className="mt-0.5 text-text">{lockedBy.length > 0 ? lockedBy.join(", ") : "Nothing (root skill)"}</dd>
        </div>
        <div className="tile px-3 py-2.5">
          <dt className="text-[11px] uppercase tracking-wide text-text-faint">Last practiced</dt>
          <dd className="mt-0.5 text-text">{node.lastPracticedAt ? daysAgo(node.lastPracticedAt) : "Never"}</dd>
        </div>
        <div className="tile px-3 py-2.5">
          <dt className="text-[11px] uppercase tracking-wide text-text-faint">Maintenance</dt>
          <dd className="mt-0.5 text-text">{node.maintenanceDays ? `Every ${node.maintenanceDays} days` : "Not needed"}</dd>
        </div>
      </dl>

      {node.state === "locked" && (
        <p className="mt-3 text-[12px] text-text-faint">
          Locked until its prerequisites are complete. Practice still counts: XP earned now is kept.
        </p>
      )}
      {node.state === "rusty" && (
        <p className="mt-3 text-[12px] text-orange">
          Not practiced in over {node.maintenanceDays} days. Your XP is kept; a practice session clears the rust.
        </p>
      )}
    </Panel>
  );
}
