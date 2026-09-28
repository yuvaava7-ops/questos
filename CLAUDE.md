# CLAUDE.md

Guidance for Claude Code (or any Claude session) working in this repo.

## What this project is

QuestOS — a personal RPG-styled life tracker. Full goal/scope/roadmap lives in `docs/PROJECT_SCOPE.md` — read that first for context on where this is headed. This file is about *how* to work in the codebase day to day.

## Current state

MVP stage: Next.js + TypeScript dashboard backed by Supabase (Postgres) — no mock data, no `data/` directory. `/` is the public marketing/landing page; the actual dashboard lives at `/dashboard`. Real accounts via Supabase Auth (email/password), every table scoped by `user_id` with `auth.uid()`-enforced RLS (see `supabase/schema.sql`), `middleware.ts` gates `/dashboard` behind login. Skill trees (graph of nodes with prerequisites), the XP ledger, leveling, and the MCP server at `/api/mcp` exist; live integrations (GitHub, health data) don't yet — check `docs/PROJECT_SCOPE.md`'s "Current Status" section, which should be kept up to date as phases land.

## Stack & conventions

- **Next.js (App Router) + React + TypeScript** — strict mode on, avoid `any`
- **Tailwind CSS** for all styling — no CSS-in-JS, no separate stylesheet files per component
- **Component style**: functional components, one component per file, colocate small pieces in `components/`, shared types in `lib/types.ts`
- **Data**: `lib/supabase.ts` is the client, `lib/queries.ts` holds server-side reads (called from Server Components), `lib/actions.ts` holds `"use server"` mutations — all typed against `lib/types.ts`. Schema changes go in `supabase/schema.sql`. No mock data — an empty table should render an empty state, not placeholder rows
- **Icons**: `lucide-react` only, no custom SVG icon sets, no emoji in production UI copy (emoji were used as placeholders in the original prototype — replace with lucide icons as components are touched)
- **Naming**: PascalCase components, camelCase functions/variables, kebab-case file names for non-component files

## Design direction

Dark theme, RPG/quest framing throughout (quests not "tasks" where user-facing, XP/levels not generic "points"). Look is dark fantasy: charcoal stone panels in steel frames, parchment scrolls, painted gems/orbs, Cinzel headings, Alegreya Sans body. Painted sprites live in `public/ui/` (CC0, "FANTASY GUI" by MELLE, see `public/ui/LICENSE.txt`); colors are CSS variables in `app/globals.css` mapped to Tailwind tokens. Use the `frame` / `parchment` / `tile` / `btn-gem` classes, `Panel` (`variant`), `ProgressBar` (`tone`), and `CheckToggle` rather than restyling cards ad hoc, and avoid neon glows and gradient chrome. Reference the original static HTML prototypes in `docs/reference/` for the visual language (colors, spacing, card style) if rebuilding a section — match that direction rather than defaulting to generic dashboard UI.

## When adding a skill tree or data model change

Any change to `SkillTreeView` / `SkillNodeView` (see `lib/types.ts`) should stay compatible with the "one generic tree-rendering component handles every tree" principle from the scope doc (`components/skills/SkillTreeGraph.tsx`); don't special-case a specific tree in the renderer.

- XP lives only in the `xp_events` ledger; level and node progress are derived from it (`lib/leveling.ts`, `lib/skill-trees.ts`). Don't store derived XP elsewhere.
- Aggregate in Postgres (`xp_summary`, `activity_counts`), never by fetching raw rows: PostgREST caps selects at 1000 rows.
- Skill-tree data access goes through `lib/skill-data.ts`, which takes `(db, userId)` so the web app and the MCP endpoint share it. On the MCP side the client is service-role, so the explicit `user_id` filter is the only scoping. Never drop it.
- New schema goes in `supabase/schema.sql` **and** a new idempotent file in `supabase/migrations/`.

## Before committing

- `npm run lint` and `npm run build` should both pass
- Keep `docs/PROJECT_SCOPE.md`'s roadmap/status section current when a phase completes
