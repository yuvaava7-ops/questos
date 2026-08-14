# QuestOS

An RPG-styled personal dashboard that turns daily habits — workouts, meals, sleep, coding, creative work — into quests, XP, and skill trees.

Full goal, feature list, data model, and roadmap: [`docs/PROJECT_SCOPE.md`](./docs/PROJECT_SCOPE.md)
Working notes for Claude Code sessions in this repo: [`CLAUDE.md`](./CLAUDE.md)

## Status

🚧 MVP — home dashboard backed by Supabase, no mock data. Real accounts via Supabase Auth, data isolated per user via RLS. Skill tree page and live integrations (GitHub, health data) are planned but not built (see roadmap in the scope doc).

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · lucide-react · Supabase (Postgres + Auth) · anime.js

## Getting started

```bash
npm install
```

Create a Supabase project, run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL editor, then copy `.env.example` to `.env.local` and fill in your project URL + anon key (and `NEXT_PUBLIC_SITE_URL` if deploying).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `/` is the public marketing page; sign up from there to reach `/dashboard`. Without Supabase configured, `/dashboard` shows a setup screen instead of your data.

## Project structure

```
app/                Next.js App Router pages
  page.tsx           Public marketing/landing page (header, scroll-scrub hero, CTA)
  dashboard/page.tsx  The actual dashboard (Server Component, fetches from Supabase) — protected
  (auth)/             Login + sign-up (no Sidebar chrome)
    login/page.tsx
    signup/page.tsx
  auth/callback/       Route Handler for email-confirmation redirects
  layout.tsx
  error.tsx           Error boundary for failed Supabase queries
  globals.css
components/          UI components (Sidebar, StatCard, QuestList, etc.)
  auth/                Login/sign-up UI (CameraHero, LoginForm, SignUpForm, AuthCard)
  marketing/            Landing page UI (Header, ScrollScrubHero)
lib/
  types.ts            Shared TypeScript types (SkillTree, Quest, etc.)
  supabase/            Supabase clients — server.ts, client.ts, middleware.ts, config.ts
  auth.ts              getCurrentUser / requireUser (server-side)
  auth-actions.ts       Sign up/in/out server actions
  queries.ts           Server-side data fetching + derived stats/streak/activity, scoped per user
  actions.ts           Server actions for quest/task CRUD, scoped per user
middleware.ts        Gates /dashboard behind login, bounces logged-in users off / and /login
supabase/
  schema.sql           Table definitions + per-user RLS policies — run once per project
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
