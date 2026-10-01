// Level curve: going from level L to L+1 costs 100 + 50 * (L - 1) XP
// (100, 150, 200, ...), so early levels come quickly and later ones take
// sustained effort. Level is always derived from total XP in the ledger.

const TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 50, title: "Legend" },
  { minLevel: 35, title: "Master" },
  { minLevel: 20, title: "Expert" },
  { minLevel: 10, title: "Adept" },
  { minLevel: 5, title: "Apprentice" },
  { minLevel: 1, title: "Novice" },
];

export function xpForNextLevel(level: number): number {
  return 100 + 50 * (level - 1);
}

export function titleForLevel(level: number): string {
  return TITLES.find((t) => level >= t.minLevel)?.title ?? "Novice";
}

export interface LevelProgress {
  level: number;
  levelTitle: string;
  totalXp: number;
  xp: number; // XP earned inside the current level
  xpToNextLevel: number; // XP the current level costs in total
}

export function levelFromTotalXp(totalXp: number): LevelProgress {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  while (remaining >= xpForNextLevel(level)) {
    remaining -= xpForNextLevel(level);
    level++;
  }
  return {
    level,
    levelTitle: titleForLevel(level),
    totalXp: Math.max(0, Math.floor(totalXp)),
    xp: remaining,
    xpToNextLevel: xpForNextLevel(level),
  };
}
