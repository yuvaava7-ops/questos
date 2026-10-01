import { getTrees, getXpProgress } from "@/lib/queries";
import { Window } from "@/components/pixel/Window";
import { EmptyTrees, TreeCard } from "@/components/skills/SkillTreesPanel";

export default async function SkillTreesPage() {
  const trees = await getTrees(await getXpProgress());

  return (
    <>
      <h1 className="px-title mb-2 mt-6 text-[16px] text-gold">Skill Trees</h1>
      <p className="text-[22px] leading-tight text-dim">
        Each node is a real capability. Finish quests linked to a node to earn its XP; completing one unlocks what builds on it. Skills
        you stop practicing turn rusty.
      </p>

      <Window className="mt-7">
        {trees.length === 0 ? (
          <EmptyTrees />
        ) : (
          <div className="flex flex-col gap-4">
            {trees.map((t) => (
              <TreeCard key={t.id} tree={t} />
            ))}
          </div>
        )}
      </Window>
    </>
  );
}
