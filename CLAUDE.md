# CLAUDE.md

Guidance for Claude Code (or any Claude session) working in this repo.

## What this project is

QuestOS — a personal RPG-styled life tracker. Full goal/scope/roadmap lives in `docs/PROJECT_SCOPE.md` — read that first for context on where this is headed. This file is about *how* to work in the codebase day to day.

## Current state

MVP stage: Next.js + TypeScript dashboard backed by Supabase (Postgres) — no mock data, no `data/` directory. `/` is the public marketing/landing page; the actual dashboard lives at `/dashboard`. Real accounts via Supabase Auth (email/password), every table scoped by `user_id` with `auth.uid()`-enforced RLS (see `supabase/schema.sql`), `middleware.ts` gates `/dashboard` behind login. Don't assume the skill tree page or live integrations (GitHub, health data) exist until they're actually added — check `docs/PROJECT_SCOPE.md`'s "Current Status" section, which should be kept up to date as phases land.

## Stack & conventions

- **Next.js (App Router) + React + TypeScript** — strict mode on, avoid `any`
- **Tailwind CSS** for all styling — no CSS-in-JS, no separate stylesheet files per component
- **Component style**: functional components, one component per file, colocate small pieces in `components/`, shared types in `lib/types.ts`
- **Data**: `lib/supabase.ts` is the client, `lib/queries.ts` holds server-side reads (called from Server Components), `lib/actions.ts` holds `"use server"` mutations — all typed against `lib/types.ts`. Schema changes go in `supabase/schema.sql`. No mock data — an empty table should render an empty state, not placeholder rows
- **Icons**: `lucide-react` only, no custom SVG icon sets, no emoji in production UI copy (emoji were used as placeholders in the original prototype — replace with lucide icons as components are touched)
- **Naming**: PascalCase components, camelCase functions/variables, kebab-case file names for non-component files

## Design direction

Dark theme, RPG/quest framing throughout (quests not "tasks" where user-facing, XP/levels not generic "points"). Reference the original static HTML prototypes in `docs/reference/` for the visual language (colors, spacing, card style) if rebuilding a section — match that direction rather than defaulting to generic dashboard UI.

## When adding a skill tree or data model change

Any change to `SkillTree` / `SkillTier` / `Perk` shapes (see `lib/types.ts`) should stay compatible with the "one generic tree-rendering component handles every tree" principle from the scope doc — don't special-case a specific tree in the renderer.

## Before committing

- `npm run lint` and `npm run build` should both pass
- Keep `docs/PROJECT_SCOPE.md`'s roadmap/status section current when a phase completes
