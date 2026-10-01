// Level curve: reaching level L takes 50 * L * (L - 1) total XP
// (L2 = 100, L3 = 300, L4 = 600, ...), so each level costs 100 XP more than the last.

const TITLES = [
  "Novice",
  "Apprentice",
  "Adventurer",
  "Ranger",
  "Knight",
  "Champion",
  "Paladin",
  "Hero",
  "Legend",
  "Mythic",
];

export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export interface LevelInfo {
  level: number;
  title: string;
  /** XP earned inside the current level. */
  into: number;
  /** XP the current level spans. */
  span: number;
  /** 0..1 progress through the current level. */
  fraction: number;
}

export function levelFromXp(totalXp: number): LevelInfo {
  const xp = Math.max(0, totalXp);
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const floor = xpForLevel(level);
  const span = xpForLevel(level + 1) - floor;
  const into = xp - floor;
  return {
    level,
    title: TITLES[Math.min(level - 1, TITLES.length - 1)],
    into,
    span,
    fraction: into / span,
  };
}
