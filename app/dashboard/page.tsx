import { QuestBoard } from "@/components/game/QuestBoard";
import { Errands } from "@/components/game/Errands";
import { Dailies } from "@/components/game/Dailies";
import { Trophies } from "@/components/game/Trophies";
import { SkillTreesPanel } from "@/components/skills/SkillTreesPanel";
import { Chronicle } from "@/components/game/Chronicle";
import type { Fanfare } from "@/components/game/LevelUp";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ACHIEVEMENT_BY_KEY } from "@/lib/achievements";
import { streakMultiplier } from "@/lib/multiplier";
import { todayISO } from "@/lib/dates";
import {
  ensureDailies,
  evaluateAchievements,
  getBoss,
  getHabits,
  getLoginState,
  getUnlockedKeys,
  safe,
} from "@/lib/game-data";
import {
  getActivity,
  getAvatar,
  getNodeOptions,
  getProfileExtras,
  getProfileName,
  getQuests,
  getStatXp,
  getTasks,
  getTrees,
  getXpProgress,
} from "@/lib/queries";

export default async function DashboardPage() {
  const user = await requireUser();
  const db = createClient();

  // Order matters: dailies must exist before quests are read, and achievement
  // payouts must land before XP is read.
  await safe("dailies", () => ensureDailies(db, user.id), undefined);
  const boss = await safe("boss", () => getBoss(db, user.id), null);
  const fresh = await safe("achievements", () => evaluateAchievements(db, user.id), []);

  const [name, avatar, quests, tasks, xp, statXp, nodeOptions, activity, habits, loginState, unlocked, extras] = await Promise.all([
    getProfileName(),
    getAvatar(),
    getQuests(),
    getTasks(),
    getXpProgress(),
    getStatXp(),
    getNodeOptions(),
    getActivity(),
    safe("habits", () => getHabits(db, user.id), []),
    safe("login rewards", () => getLoginState(db, user.id), null),
    safe("trophies", () => getUnlockedKeys(db, user.id), []),
    safe("profile extras", () => getProfileExtras(), { titleKey: null, isPublic: false, publicSlug: null }),
  ]);
  const trees = await getTrees(xp);
  const hero = name && name !== "You" ? name : "Hero";

  // Streak through yesterday: today's own quests must not change today's bonus.
  const todayCell = activity.days.find((d) => d.date === todayISO());
  const streakBefore = todayCell && todayCell.count > 0 ? Math.max(0, activity.streakDays - 1) : activity.streakDays;

  const titleName = (extras.titleKey && ACHIEVEMENT_BY_KEY.get(extras.titleKey)?.name) || null;
  const fanfares: Fanfare[] = fresh.map((a) => ({
    headline: "ACHIEVEMENT!",
    big: a.name,
    sub: `${a.description} +${a.reward} XP`,
  }));

  return (
    <QuestBoard
      name={hero}
      quests={quests}
      totalXp={xp.total}
      statXp={statXp}
      avatar={avatar}
      streakDays={activity.streakDays}
      multiplier={streakMultiplier(streakBefore)}
      titleName={titleName}
      boss={boss}
      login={loginState && !loginState.claimedToday ? loginState : null}
      achievementFanfares={fanfares}
      nodeOptions={nodeOptions}
      dailies={<Dailies habits={habits} />}
      trophies={<Trophies unlockedKeys={unlocked.map((u) => u.key)} titleKey={extras.titleKey} />}
      errands={<Errands tasks={tasks} />}
      skills={<SkillTreesPanel trees={trees} />}
      chronicle={<Chronicle days={activity.days} streakDays={activity.streakDays} />}
    />
  );
}
