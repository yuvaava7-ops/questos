// Character stats and classes. Quests are tagged with a stat; completed-quest
// XP per stat sets each stat level, and the top stats decide the class.

export const STAT_KEYS = ["str", "int", "dex", "wis", "cha"] as const;
export type StatKey = (typeof STAT_KEYS)[number];

export type StatColor = "ruby" | "sky" | "leaf" | "grape" | "gold";

export const STATS: Record<StatKey, { abbr: string; name: string; blurb: string; color: StatColor }> = {
  str: { abbr: "STR", name: "Strength", blurb: "Body: workouts, sports, chores", color: "ruby" },
  int: { abbr: "INT", name: "Intellect", blurb: "Mind: study, coding, reading", color: "sky" },
  dex: { abbr: "DEX", name: "Dexterity", blurb: "Craft: building, art, music", color: "leaf" },
  wis: { abbr: "WIS", name: "Wisdom", blurb: "Spirit: sleep, calm, habits", color: "grape" },
  cha: { abbr: "CHA", name: "Charisma", blurb: "Social: friends, speaking, work", color: "gold" },
};

export type StatXp = Record<StatKey, number>;

export function emptyStatXp(): StatXp {
  return { str: 0, int: 0, dex: 0, wis: 0, cha: 0 };
}

export function isStatKey(value: unknown): value is StatKey {
  return typeof value === "string" && (STAT_KEYS as readonly string[]).includes(value);
}

export interface StatLevel {
  value: number;
  /** 0..1 progress to the next point. */
  fraction: number;
}

// A stat is 1 + floor(sqrt(xp / 4)): 100 XP is 6, 400 XP is 11, 1600 XP is 21.
export function statLevel(xp: number): StatLevel {
  const safe = Math.max(0, xp);
  const value = 1 + Math.floor(Math.sqrt(safe / 4));
  const floor = 4 * (value - 1) ** 2;
  const next = 4 * value ** 2;
  return { value, fraction: (safe - floor) / (next - floor) };
}

export interface HeroClass {
  name: string;
  blurb: string;
  /** Stat that dominates, or null while still an Adventurer. */
  primary: StatKey | null;
}

const SINGLE: Record<StatKey, HeroClass> = {
  str: { name: "Warrior", blurb: "Forged by sweat and iron.", primary: "str" },
  int: { name: "Mage", blurb: "Power through knowledge.", primary: "int" },
  dex: { name: "Rogue", blurb: "Quick hands, clever work.", primary: "dex" },
  wis: { name: "Monk", blurb: "Calm mind, steady habits.", primary: "wis" },
  cha: { name: "Bard", blurb: "The party starts with you.", primary: "cha" },
};

const PAIRS: Record<string, { name: string; blurb: string }> = {
  "str+int": { name: "Spellblade", blurb: "Muscle and mind in one." },
  "str+dex": { name: "Ranger", blurb: "Strong, swift, always moving." },
  "str+wis": { name: "Paladin", blurb: "Strength guided by discipline." },
  "str+cha": { name: "Gladiator", blurb: "Strong, and the crowd loves it." },
  "int+dex": { name: "Artificer", blurb: "Builds clever things." },
  "int+wis": { name: "Sage", blurb: "Learns deeply, lives calmly." },
  "int+cha": { name: "Loremaster", blurb: "Knows it, and can explain it." },
  "dex+wis": { name: "Shadow Monk", blurb: "Silent focus, precise hands." },
  "dex+cha": { name: "Swashbuckler", blurb: "Skill with style." },
  "wis+cha": { name: "Cleric", blurb: "Steady, kind, trusted." },
};

const ADVENTURER: HeroClass = { name: "Adventurer", blurb: "Tag quests with stats to find your class.", primary: null };

/** Total stat XP needed before a class is awarded. */
export const CLASS_THRESHOLD = 50;

export function classFor(xp: StatXp): HeroClass {
  const ranked = STAT_KEYS.map((k) => ({ k, xp: xp[k] })).sort((a, b) => b.xp - a.xp);
  const total = ranked.reduce((s, r) => s + r.xp, 0);
  if (total < CLASS_THRESHOLD) return ADVENTURER;
  const [first, second] = ranked;
  // A clear specialist gets a pure class; otherwise the top two blend.
  if (second.xp === 0 || first.xp >= second.xp * 1.6) return SINGLE[first.k];
  const key = [first.k, second.k].sort((a, b) => STAT_KEYS.indexOf(a) - STAT_KEYS.indexOf(b)).join("+");
  return { ...PAIRS[key], primary: first.k };
}
