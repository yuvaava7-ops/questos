# QuestOS

An RPG-styled personal dashboard that turns daily habits — workouts, meals, sleep, coding, creative work — into quests, XP, and skill trees.

Full goal, feature list, data model, and roadmap: [`docs/PROJECT_SCOPE.md`](./docs/PROJECT_SCOPE.md)
Working notes for Claude Code sessions in this repo: [`CLAUDE.md`](./CLAUDE.md)

## Status

🚧 MVP — home dashboard only, static mock data, no backend yet. Skill tree page, Supabase, and live integrations (GitHub, health data) are planned but not built (see roadmap in the scope doc).

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · lucide-react

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/                Next.js App Router pages
  layout.tsx
  page.tsx           Home dashboard
  globals.css
components/          UI components (Sidebar, StatCard, QuestList, etc.)
lib/
  types.ts            Shared TypeScript types (SkillTree, Quest, etc.)
data/
  sample.ts           Mock data — swap for Supabase queries later
docs/
  PROJECT_SCOPE.md     Goal, features, data model, stack, roadmap
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint the project |

## Roadmap (short version)

1. MVP — dashboard + manual logging + one skill tree (Coding)
2. GitHub commit pull, Fitness tree, real heatmap data
3. Expandable tree engine (Claude-generated trees), goal → path breakdown
4. YouTube/Creative tree, health data import, polish

Full detail in [`docs/PROJECT_SCOPE.md`](./docs/PROJECT_SCOPE.md).
