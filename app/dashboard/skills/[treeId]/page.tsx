import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getSkillTree } from "@/lib/skill-data";
import { getXpProgress } from "@/lib/queries";
import { ACCENT } from "@/components/pixel/accent";
import { AccentGem } from "@/components/pixel/AccentGem";
import { SkillTreeGraph } from "@/components/skills/SkillTreeGraph";
import { DeleteTreeButton } from "@/components/skills/DeleteTreeButton";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SkillTreePage({ params }: { params: { treeId: string } }) {
  if (!UUID.test(params.treeId)) notFound();
  const user = await requireUser();
  const tree = await getSkillTree(createClient(), user.id, params.treeId, await getXpProgress());
  if (!tree) notFound();

  return (
    <>
      <Link href="/dashboard/skills" className="mb-4 mt-5 inline-block text-[22px] text-dim hover:text-gold">
        &lt; all trees
      </Link>

      <header className="mb-4 flex items-start gap-3">
        <AccentGem accent={tree.color} scale={4} />
        <div className="min-w-0 flex-1">
          <h1 className="px-title break-words text-[14px] leading-snug">{tree.name}</h1>
          <p className={`mt-1 text-[22px] leading-none ${ACCENT[tree.color].text}`}>
            {tree.percent}% · {tree.completeCount}/{tree.nodes.length} nodes
            {tree.rustyCount > 0 && <span className="text-ember"> · {tree.rustyCount} rusty</span>}
          </p>
        </div>
      </header>
      {tree.description && <p className="mb-4 text-[22px] leading-tight text-dim">{tree.description}</p>}

      {tree.nodes.length === 0 ? (
        <p className="text-[22px] text-faint">This tree has no nodes yet.</p>
      ) : (
        <SkillTreeGraph nodes={tree.nodes} accent={tree.color} />
      )}

      <div className="mt-8 flex justify-end">
        <DeleteTreeButton treeId={tree.id} treeName={tree.name} />
      </div>
    </>
  );
}
