-- Custom pixel avatar drawn by an AI over MCP (see lib/avatar.ts).
-- { art: string[16], walk: string[16] | null, palette: { "<char>": "#rrggbb" } }
-- Safe to re-run.

alter table profile add column if not exists avatar jsonb;
