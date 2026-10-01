import { QuestBoard } from "@/components/game/QuestBoard";
import { Errands } from "@/components/game/Errands";
import { Skills } from "@/components/game/Skills";
import { Chronicle } from "@/components/game/Chronicle";
import { SetupNotice } from "@/components/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActivity, getPlayerName, getQuests, getSkills, getTasks, getTotalXp } from "@/lib/queries";

// Always render fresh: streak/activity are relative to "today", and data can
// change from outside the app (Supabase Studio, another session).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const [name, quests, tasks, skills, totalXp, { days, streakDays }] = await Promise.all([
    getPlayerName(),
    getQuests(),
    getTasks(),
    getSkills(),
    getTotalXp(),
    getActivity(),
  ]);

  return (
    <main className="mx-auto w-full max-w-[560px] px-4 pb-16 pt-2">
      <QuestBoard name={name} quests={quests} totalXp={totalXp} streakDays={streakDays} />
      <Errands tasks={tasks} />
      <Skills skills={skills} />
      <Chronicle days={days} streakDays={streakDays} />
    </main>
  );
}
