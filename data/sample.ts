import type {
  Quest,
  Task,
  SkillProgress,
  StatCard,
  DayActivity,
  UserSummary,
} from "@/lib/types";

export const user: UserSummary = {
  name: "Yuval",
  level: 3,
  levelTitle: "Apprentice",
  xp: 340,
  xpToNextLevel: 500,
  streakDays: 6,
};

export const stats: StatCard[] = [
  {
    id: "quest-score",
    label: "Quest Score",
    icon: "Target",
    value: "72",
    unit: "/100",
    sub: "↑ 8 pts from yesterday",
    percent: 72,
    color: "green",
  },
  {
    id: "training",
    label: "Training",
    icon: "Dumbbell",
    value: "1",
    unit: "/2 sessions",
    sub: "Night training pending",
    percent: 50,
    color: "blue",
  },
  {
    id: "nutrition",
    label: "Nutrition",
    icon: "Egg",
    value: "2",
    unit: "/4 meals logged",
    sub: "Dinner + midday fuel pending",
    percent: 50,
    color: "orange",
  },
  {
    id: "sleep",
    label: "Sleep Goal",
    icon: "Moon",
    value: "11:15",
    unit: "PM target",
    sub: "Wake 7:45 AM · 8hr window",
    percent: 100,
    color: "purple",
  },
];

export const quests: Quest[] = [
  { id: "morning", label: "Morning Movement — jog/stretch/yoga", time: "7:45 AM", done: true, xp: 20 },
  { id: "breakfast", label: "Protein Breakfast — 3 eggs + 2 roti", time: "8:15 AM", done: true, xp: 10 },
  { id: "midday", label: "Midday Fuel — nuts/lentil bar + fruit", time: "1:00 PM", done: false, xp: 10 },
  { id: "dinner", label: "Dinner Check-in — protein + veg", time: "7:00 PM", done: false, xp: 10 },
  { id: "training", label: "Night Training — strength circuit", time: "10:00 PM", done: false, xp: 30 },
];

export const skills: SkillProgress[] = [
  { id: "fitness", name: "Fitness", icon: "Dumbbell", percent: 38, color: "green" },
  { id: "coding", name: "Coding", icon: "Code2", percent: 61, color: "blue" },
  { id: "illustration", name: "Illustration", icon: "Palette", percent: 12, color: "purple" },
  { id: "study", name: "Study", icon: "BookOpen", percent: 27, color: "orange" },
];

export const tasks: Task[] = [
  { id: "t1", label: "Fix CCAvenue settlement issue", priority: "high", done: false },
  { id: "t2", label: "Stellar CRM invoicing module", priority: "medium", done: false },
  { id: "t3", label: "Partner site — homepage fixes", priority: "low", done: true },
  { id: "t4", label: "Portfolio About page redesign", priority: "low", done: false },
];

// Generates a mock 14-week activity heatmap. Replace with a real query once
// quest completions are persisted (Supabase, Phase 2).
export function generateActivity(): DayActivity[] {
  const days: DayActivity[] = [];
  const weeks = 14;
  const today = new Date();
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const recency = 1 - i / (weeks * 7);
    const rand = Math.random();
    let level: DayActivity["level"] = 0;
    if (recency > 0.75 && rand > 0.2) level = (Math.floor(rand * 4) + 1) as DayActivity["level"];
    else if (rand > 0.7) level = Math.floor(rand * 3) as DayActivity["level"];
    days.push({ date: d.toISOString().slice(0, 10), level });
  }
  return days;
}
