import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getSkillTree } from "@/lib/skill-data";
import { getXpProgress } from "@/lib/queries";
import { ACCENT_CLASSES } from "@/lib/theme";
import { DynamicIcon } from "@/components/DynamicIcon";
import { SkillTreeGraph } from "@/components/skills/SkillTreeGraph";
import { DeleteTreeButton } from "@/components/skills/DeleteTreeButton";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SkillTreePage({ params }: { params: { treeId: string } }) {
  if (!UUID.test(params.treeId)) notFound();
  const user = await requireUser();
  const tree = await getSkillTree(createClient(), user.id, params.treeId, await getXpProgress());
  if (!tree) notFound();

  const accent = ACCENT_CLASSES[tree.color];
  const icons = Object.fromEntries(tree.nodes.map((n) => [n.id, <DynamicIcon key={n.id} name={n.icon} size={18} strokeWidth={1.75} />]));

  return (
    <>
      <Link href="/dashboard/skills" className="mb-4 inline-flex items-center gap-1 text-[12.5px] text-text-faint hover:text-text">
        <ChevronLeft size={14} /> All skill trees
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${accent.dim} ${accent.text}`}>
              <DynamicIcon name={tree.icon} size={22} strokeWidth={2} />
            </span>
            <h1 className="font-display text-[26px] font-semibold tracking-wide md:text-[32px]">{tree.name}</h1>
          </div>
          {tree.description && <p className="mt-2 max-w-2xl text-[13px] text-text-faint">{tree.description}</p>}
          <div className="mt-2 flex flex-wrap gap-x-4 font-display text-[11.5px] text-text-faint">
            <span>{tree.percent}% of tree XP</span>
            <span>
              {tree.completeCount}/{tree.nodes.length} nodes complete
            </span>
            {tree.rustyCount > 0 && <span className="text-orange">{tree.rustyCount} rusty</span>}
          </div>
        </div>
        <DeleteTreeButton treeId={tree.id} treeName={tree.name} />
      </header>

      {tree.nodes.length === 0 ? (
        <p className="text-[13px] text-text-faint">This tree has no nodes yet.</p>
      ) : (
        <SkillTreeGraph nodes={tree.nodes} accent={tree.color} icons={icons} />
      )}
    </>
  );
}
