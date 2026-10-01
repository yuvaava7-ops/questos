# CLAUDE.md

Guidance for Claude Code (or any Claude session) working in this repo.

## What this project is

QuestOS — a personal RPG-styled life tracker. Full goal/scope/roadmap lives in `docs/PROJECT_SCOPE.md` — read that first for context on where this is headed. This file is about *how* to work in the codebase day to day.

## Current state

Next.js + TypeScript game UI backed by Supabase (Postgres), no mock data. `/` is the public title screen; the app lives under `/dashboard` (Quests, Skills, Camp tabs). Real accounts via Supabase Auth, every table scoped by `user_id` with RLS (see `supabase/schema.sql` and `supabase/migrations/`). `middleware.ts` gates `/dashboard`. Level and XP come from the `xp_events` ledger (`lib/leveling.ts`). Skill trees are graphs rendered by one generic component (`components/skills/SkillTreeGraph.tsx`). An MCP server at `/api/mcp` (and `/api/mcp/<token>` for connectors without header support) lets Claude and ChatGPT read progress, build trees and plan quests; tokens are created from the Camp tab and need `SUPABASE_SERVICE_ROLE_KEY` set server-side. Integrations (GitHub, health data) are not built yet. `docs/PROJECT_SCOPE.md` has the roadmap.

## Stack & conventions

- **Next.js (App Router) + React + TypeScript** — strict mode on, avoid `any`
- **Tailwind CSS** for all styling — no CSS-in-JS, no separate stylesheet files per component
- **Component style**: functional components, one component per file; game screens in `components/game/`, pixel primitives in `components/pixel/`, shared types in `lib/types.ts`
- **Data**: `lib/supabase.ts` is the client, `lib/queries.ts` holds server-side reads (called from Server Components), `lib/actions.ts` holds `"use server"` mutations — all typed against `lib/types.ts`. Schema changes go in `supabase/schema.sql`. No mock data — an empty table should render an empty state, not placeholder rows
- **Art**: 16-bit pixel style. Sprites are string grids in `components/pixel/sprites.ts` rendered by `<Sprite>` (crisp SVG rects) — no icon libraries, no emoji, no smooth gradients/rounded corners. UI chrome uses the `.win` / `.px-btn` / `.px-input` classes in `app/globals.css`; fonts are Press Start 2P (headings) and VT323 (body). Motion uses `steps()` easing, never smooth easing
- **Naming**: PascalCase components, camelCase functions/variables, kebab-case file names for non-component files

## Design direction

SNES-era RPG: night-sky indigo, blue menu windows with white rims, gold accents, chunky pixel type. Quest framing throughout (quests not "tasks" where user-facing, XP/levels not generic "points"). Mobile-first — the dashboard is a single column capped at 560px. Level and XP come from the XP ledger (`lib/leveling.ts`), not the stored `profile.level`/`xp` columns.

## When adding a skill tree or data model change

Any change to `SkillTree` / `SkillTier` / `Perk` shapes (see `lib/types.ts`) should stay compatible with the "one generic tree-rendering component handles every tree" principle from the scope doc — don't special-case a specific tree in the renderer.

## Before committing

- `npm run lint` and `npm run build` should both pass
- Keep `docs/PROJECT_SCOPE.md`'s roadmap/status section current when a phase completes
