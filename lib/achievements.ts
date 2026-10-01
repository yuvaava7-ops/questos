// Achievement definitions. Unlocks are stored (achievements table); whether one
// should unlock is decided here from a snapshot of the player's progress.

export interface Facts {
  questsDone: number;
  streakDays: number;
  level: number;
  hasClass: boolean;
  topStatLevel: number;
  treesCreated: number;
  nodesComplete: number;
  treesComplete: number;
  bossesDefeated: number;
  habits: number;
  loginClaims: number;
}

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  /** XP granted on unlock. */
  reward: number;
  test: (f: Facts) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "first_quest", name: "First Blood", description: "Complete your first quest.", reward: 10, test: (f) => f.questsDone >= 1 },
  { key: "quests_10", name: "Getting Started", description: "Complete 10 quests.", reward: 25, test: (f) => f.questsDone >= 10 },
  { key: "quests_50", name: "Seasoned", description: "Complete 50 quests.", reward: 50, test: (f) => f.questsDone >= 50 },
  { key: "quests_200", name: "Veteran", description: "Complete 200 quests.", reward: 150, test: (f) => f.questsDone >= 200 },
  { key: "streak_3", name: "Warming Up", description: "Keep a 3-day streak.", reward: 15, test: (f) => f.streakDays >= 3 },
  { key: "streak_7", name: "On Fire", description: "Keep a 7-day streak.", reward: 50, test: (f) => f.streakDays >= 7 },
  { key: "streak_30", name: "Unstoppable", description: "Keep a 30-day streak.", reward: 250, test: (f) => f.streakDays >= 30 },
  { key: "level_5", name: "Rising Star", description: "Reach level 5.", reward: 40, test: (f) => f.level >= 5 },
  { key: "level_10", name: "Hero of the Realm", description: "Reach level 10.", reward: 100, test: (f) => f.level >= 10 },
  { key: "level_20", name: "Living Legend", description: "Reach level 20.", reward: 300, test: (f) => f.level >= 20 },
  { key: "class", name: "Found Your Path", description: "Unlock a hero class.", reward: 30, test: (f) => f.hasClass },
  { key: "stat_10", name: "Specialist", description: "Raise any stat to 10.", reward: 60, test: (f) => f.topStatLevel >= 10 },
  { key: "habit", name: "Creature of Habit", description: "Create your first daily.", reward: 15, test: (f) => f.habits >= 1 },
  { key: "tree", name: "Cartographer", description: "Chart your first skill tree.", reward: 25, test: (f) => f.treesCreated >= 1 },
  { key: "perk", name: "Perk Unlocked", description: "Complete a skill-tree node.", reward: 40, test: (f) => f.nodesComplete >= 1 },
  { key: "constellation", name: "Constellation Complete", description: "Complete every node of a skill tree.", reward: 200, test: (f) => f.treesComplete >= 1 },
  { key: "boss", name: "Boss Slayer", description: "Defeat a weekly boss.", reward: 50, test: (f) => f.bossesDefeated >= 1 },
  { key: "login_7", name: "Regular", description: "Claim 7 daily login rewards.", reward: 40, test: (f) => f.loginClaims >= 7 },
  { key: "login_30", name: "Loyal Companion", description: "Claim 30 daily login rewards.", reward: 150, test: (f) => f.loginClaims >= 30 },
];

export const ACHIEVEMENT_BY_KEY = new Map(ACHIEVEMENTS.map((a) => [a.key, a]));

export function newlyEarned(facts: Facts, unlockedKeys: Set<string>): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => !unlockedKeys.has(a.key) && a.test(facts));
}
