-- Character stats: each quest can train one of five stats (STR/INT/DEX/WIS/CHA).
-- Completed-quest XP per stat drives stat levels and the character class.
-- Safe to re-run.

alter table quests add column if not exists stat text
  check (stat in ('str', 'int', 'dex', 'wis', 'cha'));

-- Completed-quest XP per stat. Aggregated in Postgres so PostgREST's row cap
-- can't truncate the totals. Runs as the caller, so RLS still applies.
create or replace function stat_xp(p_user_id uuid)
returns table (stat text, xp bigint)
language sql stable security invoker set search_path = public
as $$
  select stat, sum(xp)::bigint
  from quests
  where user_id = p_user_id and done and stat is not null
  group by stat
$$;
