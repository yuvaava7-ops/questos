# QuestOS

An RPG-styled personal dashboard that turns daily habits — workouts, meals, sleep, coding, creative work — into quests, XP, and skill trees.

Full goal, feature list, data model, and roadmap: [`docs/PROJECT_SCOPE.md`](./docs/PROJECT_SCOPE.md)
Working notes for Claude Code sessions in this repo: [`CLAUDE.md`](./CLAUDE.md)

## Status

🚧 MVP: dashboard, quests/tasks, XP ledger and leveling, skill trees, and an MCP server so Claude can generate skill trees and plan quests. Real accounts via Supabase Auth, data isolated per user via RLS. GitHub/health integrations are planned but not built (see the scope doc).

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · lucide-react · Supabase (Postgres + Auth) · anime.js

Painted UI sprites (panels, parchment, gem buttons, orbs, bars) in `public/ui/` are from [FANTASY GUI by MELLE](https://opengameart.org/content/fantasy-gui-0) (CC0). Fantasy icon set from [game-icons.net](https://game-icons.net) (`icons/game/`, CC BY 3.0) — icons currently used are credited by author as they're added; see `icons/license.txt` for the full contributor list. Register new ones in `icons/game/index.tsx`.

## Getting started

```bash
npm install
```

Create a Supabase project, run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL editor, then copy `.env.example` to `.env.local` and fill in your project URL + anon key. Also turn **Confirm email** off under Authentication > Providers > Email in the Supabase dashboard — sign-up expects an immediate session, not an email-confirmation step.

Existing project from before skill trees? Run [`supabase/migrations/001_skill_trees_xp_mcp.sql`](./supabase/migrations/001_skill_trees_xp_mcp.sql) in the SQL editor instead (it's idempotent).

```bash
npm run dev
```

### Connecting Claude (MCP)

1. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (server-only; Project Settings > API).
2. Open `/dashboard/settings`, create a token, and copy the generated command, e.g.
   `claude mcp add --transport http questos https://<your-host>/api/mcp --header "Authorization: Bearer qos_..."`
3. Ask Claude: "Build me a skill tree for learning Rust" or "Plan today's quests around my rusty skills."

Token auth works with Claude Code and any MCP client that can send headers. claude.ai web connectors require OAuth, which isn't implemented yet.

Open [http://localhost:3000](http://localhost:3000). `/` is the public marketing page; sign up from there to reach `/dashboard`. Without Supabase configured, `/dashboard` shows a setup screen instead of your data.

## Project structure

```
app/                Next.js App Router pages
  page.tsx           Public marketing/landing page (header, animated headline, features, CTA)
  dashboard/          Protected app (layout has Sidebar/MobileTopBar)
    page.tsx           Dashboard
    skills/            Skill tree list + [treeId] graph view
    settings/          MCP API tokens + connection instructions
  api/mcp/route.ts    MCP endpoint (Streamable HTTP, bearer-token auth)
  (auth)/             Login + sign-up (no Sidebar chrome)
    login/page.tsx
    signup/page.tsx
  layout.tsx
  error.tsx           Error boundary for failed Supabase queries
  globals.css
components/          UI components (Sidebar, QuestList, etc.) + shared primitives (Panel, ProgressBar, BrandMark, CheckToggle, DynamicIcon)
  auth/                Login/sign-up UI (CameraHero, LoginForm, SignUpForm, AuthCard)
  marketing/            Landing page UI (Header, AnimatedHeadline)
lib/
  types.ts            Shared TypeScript types (SkillTree, Quest, etc.)
  supabase/            Supabase clients — server.ts, client.ts, middleware.ts, config.ts
  auth.ts              getCurrentUser / requireUser (server-side)
  auth-actions.ts       Sign up/in/out server actions
  queries.ts           Server-side reads for the web app (request-cached)
  skill-data.ts        Skill tree + XP ledger data access, shared by web app and MCP
  skill-trees.ts       Pure tree logic: validation, tiers, node states
  tree-layout.ts       Pure graph layout for the tree renderer
  leveling.ts          Level curve + titles from total XP
  activity.ts          Heatmap/streak computation
  mcp/server.ts        MCP tools + instructions for Claude
  api-tokens.ts        Token generation/hashing
  quest-score.ts       Pure Quest Score / trend / XP-percent helpers
  dates.ts             UTC date helpers shared by queries and actions
  theme.ts             Accent color class maps + shared input/button classes
  actions.ts           Server actions for quest/task CRUD, scoped per user
middleware.ts        Gates /dashboard behind login, bounces logged-in users off / and /login
supabase/
  schema.sql           Full schema + per-user RLS policies for a fresh project
  migrations/          Incremental, idempotent upgrades for existing projects
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
