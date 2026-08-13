# QuestOS — Project Scope

_Source of truth for goal, features, data model, stack, and roadmap. Originally drafted on Miro, mirrored here so it lives with the code._

## End Goal

An RPG-styled personal dashboard that turns daily life into a game: log or auto-pull what you did (commits, workouts, sleep, videos made, etc.), earn XP, level up, and unlock perks on Skyrim-style skill trees — one per area of life (Fitness, Coding, YouTube/Creative, and any custom tree described later).

Long-term: a daily-use tool that also becomes a strong portfolio/job-search piece, and possibly a public product later (Habitica-adjacent, differentiated by LLM-generated custom skill trees).

## Core Features

- **Dashboard home page** — GitHub-style day-box grid (contribution heatmap), today's box expanded, mini stat view per active tree
- **Tracked data** — calories + burn, heart rate, sleep, projects worked on, GitHub commits (pulled live via GitHub API)
- **Skill trees (Skyrim-style)**
  - **Fitness** — gated by BMI trend + streaks, perks like Lean / Muscle / Strong
  - **Coding** — gated by commit activity/variety, perks for languages touched, PRs merged, shipped-to-prod
  - **YouTube/Creative** — sub-branches for game dev and illustration (videos published, devlogs, pieces drawn)
  - **Expandable** — describe any new tree in plain English, Claude generates it (tiers, XP curve, perks) in a shared schema
- **XP & leveling** — every logged/pulled action awards XP on a rising cost curve per tier
- **Goal → path breakdown** — set a goal, Claude breaks it into a tree/path using the same generation engine as custom trees
- **Claude integration** — powers (1) tree generation from a description, (2) goal breakdown, (3) optionally converting free-text logs into XP/category automatically

## Data Model (draft)

```ts
interface SkillTree {
  id: string;
  name: string;
  icon: string;
  description: string;
  trunkStat: string; // what drives base progression, e.g. "commit count", "manual XP"
  tiers: SkillTier[];
}

interface SkillTier {
  level: number;
  xpRequired: number;
  perks: Perk[];
}

interface Perk {
  name: string;
  description: string;
  unlockCondition: "count" | "streak" | "manual";
  icon: string;
}
```

One generic tree-rendering component handles every tree, built-in or custom.

## Recommended Stack

- **Frontend** — Next.js + React + TypeScript, Tailwind CSS, `lucide-react` for icons (no custom assets until the core loop is proven)
- **Backend/DB** — Supabase (Postgres + Auth + Storage)
- **AI** — Claude API (Anthropic SDK) for tree generation and goal breakdown, called server-side or via a serverless function
- **Integrations** — GitHub REST API for commits (public repos, or a personal access token); manual entry or CSV import for calories/HR/sleep until a health-data connector is added
- **Hosting** — Vercel

## Rough Roadmap

1. **MVP** — dashboard shell + manual logging + one working skill tree (Coding), XP/leveling logic
2. **Phase 2** — GitHub commit pull, Fitness tree, day-box heatmap wired to real data
3. **Phase 3** — expandable tree engine (describe a tree, Claude generates it), goal → path breakdown
4. **Phase 4** — YouTube/Creative tree, health data import, polish (rewards, titles, achievements)

## Current Status

This repo contains the **MVP home dashboard** — static/mock data, no backend yet. Supabase, auth, the skill tree page, and live integrations are not built yet. See README for what's implemented.
