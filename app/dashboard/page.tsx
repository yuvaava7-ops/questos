import { QuestBoard } from "@/components/game/QuestBoard";
import { Errands } from "@/components/game/Errands";
import { SkillTreesPanel } from "@/components/skills/SkillTreesPanel";
import { Chronicle } from "@/components/game/Chronicle";
import { getActivity, getAvatar, getNodeOptions, getProfileName, getQuests, getStatXp, getTasks, getTrees, getXpProgress } from "@/lib/queries";

export default async function DashboardPage() {
  const [name, avatar, quests, tasks, xp, statXp, nodeOptions, { days, streakDays }] = await Promise.all([
    getProfileName(),
    getAvatar(),
    getQuests(),
    getTasks(),
    getXpProgress(),
    getStatXp(),
    getNodeOptions(),
    getActivity(),
  ]);
  const trees = await getTrees(xp);
  const hero = name && name !== "You" ? name : "Hero";

  return (
    <QuestBoard
      name={hero}
      quests={quests}
      totalXp={xp.total}
      statXp={statXp}
      avatar={avatar}
      streakDays={streakDays}
      nodeOptions={nodeOptions}
      errands={<Errands tasks={tasks} />}
      skills={<SkillTreesPanel trees={trees} />}
      chronicle={<Chronicle days={days} streakDays={streakDays} />}
    />
  );
}
