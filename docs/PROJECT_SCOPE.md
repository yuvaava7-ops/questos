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
- **Claude integration (MCP)**: QuestOS is an MCP server (`/api/mcp`). Claude reads progress and (1) generates trees from a description, (2) breaks goals into paths, (3) plans daily quests for available/rusty skills, (4) logs free-text activity as XP
- **Skill maintenance**: nodes can have a maintenance interval; unpracticed nodes turn "rusty" (XP kept) and surface as practice quests

## Data Model

Implemented in `supabase/schema.sql` (types in `lib/types.ts`):

- `skill_trees`: name, description, icon, color, source (`manual` | `mcp`)
- `skill_nodes`: one capability in a tree: `xp_required`, `tier` (derived depth), `position`, optional `maintenance_days`
- `skill_node_prereqs`: edges; a node unlocks when all its prerequisites are complete (trees are graphs, not fixed tiers)
- `xp_events`: the XP ledger, the single source of truth. Completing a quest writes one row (to its skill node if linked); un-completing removes it. MCP `log_activity` writes rows with no quest.
- `quests.skill_node_id`: links a quest to the node it trains
- `api_tokens`: hashed personal access tokens for the MCP endpoint

Derived, never stored: user level (`lib/leveling.ts`: level L→L+1 costs 100 + 50·(L−1) XP), node state (`locked` / `available` / `complete` / `rusty`, in `lib/skill-trees.ts`).

One generic tree-rendering component handles every tree, built-in or custom.

## Recommended Stack

- **Frontend** — Next.js + React + TypeScript, Tailwind CSS, `lucide-react` for icons (no custom assets until the core loop is proven)
- **Backend/DB** — Supabase (Postgres + Auth + Storage)
- **AI** — Claude API (Anthropic SDK) for tree generation and goal breakdown, called server-side or via a serverless function
- **Integrations** — GitHub REST API for commits (public repos, or a personal access token); manual entry or CSV import for calories/HR/sleep until a health-data connector is added
- **Hosting** — Vercel

## Rough Roadmap

1. **MVP**: dashboard shell, manual logging, skill trees, XP/leveling logic, MCP server for Claude-generated trees _(done)_
2. **Phase 2** — GitHub commit pull, Fitness tree, day-box heatmap wired to real data
3. **Phase 3** — expandable tree engine (describe a tree, Claude generates it), goal → path breakdown
4. **Phase 4** — YouTube/Creative tree, health data import, polish (rewards, titles, achievements)

## Current Status

This repo contains the **MVP dashboard** at `/dashboard`, wired to Supabase for all data (no mock data). `/` is the public landing page. Accounts are real (Supabase Auth, email/password) with RLS enforcing `auth.uid() = user_id` on every table. `middleware.ts` gates `/dashboard`.

Built:
- Quests and tasks with add/toggle/delete and optimistic UI; activity heatmap and streak from completed quests
- **XP & leveling**: `xp_events` ledger; completing a quest awards XP; level and title derived from total XP
- **Skill trees**: `/dashboard/skills` (list) and `/dashboard/skills/[id]` (generic graph renderer, node detail, "Practice" adds a linked quest). Quests can be linked to a node. Rusty nodes appear on the dashboard with practice buttons.
- **MCP server** at `/api/mcp` (Streamable HTTP, stateless) with token auth from `/dashboard/settings`. Tools: get_overview, list_skill_trees, get_skill_tree, create_skill_tree, add_skill_nodes, update_skill_node, delete_skill_tree, add_quests, log_activity, get_xp_history. Requires `SUPABASE_SERVICE_ROLE_KEY`.

Not built: GitHub/health integrations, achievements, level-up rewards, OAuth for MCP (claude.ai web connectors need OAuth; Claude Code works with the bearer token), user-timezone handling (days are UTC), goal → path breakdown as a first-class feature.
