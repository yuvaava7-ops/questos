import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getSkillTree } from "@/lib/skill-data";
import { getXpProgress } from "@/lib/queries";
import { SkillTreeGraph } from "@/components/skills/SkillTreeGraph";
import { DeleteTreeButton } from "@/components/skills/DeleteTreeButton";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SkillTreePage({ params }: { params: { treeId: string } }) {
  if (!UUID.test(params.treeId)) notFound();
  const user = await requireUser();
  const tree = await getSkillTree(createClient(), user.id, params.treeId, await getXpProgress());
  if (!tree) notFound();

  return (
    <div className="mx-auto max-w-[1000px] pt-4">
      <Link href="/dashboard/skills" className="mb-5 inline-block text-[22px] text-dim hover:text-gold">
        &lt; all constellations
      </Link>

      {tree.description && <p className="mb-4 text-[22px] leading-tight text-dim">{tree.description}</p>}

      {tree.nodes.length === 0 ? (
        <p className="text-[22px] text-faint">This tree has no nodes yet.</p>
      ) : (
        <SkillTreeGraph tree={tree} />
      )}

      <div className="mt-10 flex justify-end">
        <DeleteTreeButton treeId={tree.id} treeName={tree.name} />
      </div>
    </div>
  );
}
