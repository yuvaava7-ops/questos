import { QuestBoard } from "@/components/game/QuestBoard";
import { Errands } from "@/components/game/Errands";
import { SkillTreesPanel } from "@/components/skills/SkillTreesPanel";
import { Chronicle } from "@/components/game/Chronicle";
import { getActivity, getNodeOptions, getProfileName, getQuests, getTasks, getTrees, getXpProgress } from "@/lib/queries";

export default async function DashboardPage() {
  const [name, quests, tasks, xp, nodeOptions, { days, streakDays }] = await Promise.all([
    getProfileName(),
    getQuests(),
    getTasks(),
    getXpProgress(),
    getNodeOptions(),
    getActivity(),
  ]);
  const trees = await getTrees(xp);
  const hero = name && name !== "You" ? name : "Hero";

  return (
    <>
      <QuestBoard name={hero} quests={quests} totalXp={xp.total} streakDays={streakDays} nodeOptions={nodeOptions} />
      <Errands tasks={tasks} />
      <SkillTreesPanel trees={trees} />
      <Chronicle days={days} streakDays={streakDays} />
    </>
  );
}
