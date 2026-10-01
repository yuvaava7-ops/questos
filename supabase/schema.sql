-- QuestOS — Supabase schema (multi-user, Supabase Auth)
--
-- Every table is scoped by user_id -> auth.users(id). RLS policies enforce
-- auth.uid() = user_id on every operation, so the anon key alone can never
-- read/write another user's rows — isolation is enforced by Postgres, not
-- just app-level query filters.
--
-- Run this whole file once in the Supabase SQL editor for a fresh project.

create extension if not exists "pgcrypto";

-- One row per signed-up user, auto-created by the trigger below.
-- level/level_title/xp/xp_to_next_level are LEGACY: level is now computed
-- from the xp_events ledger (lib/leveling.ts). Only `name` is still read.
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'You',
  level int not null default 1,
  level_title text not null default 'Novice',
  xp int not null default 0,
  xp_to_next_level int not null default 100,
  updated_at timestamptz not null default now()
);

-- Daily quests. `quest_date` groups quests into the day they belong to;
-- `completed_at` is stamped when marked done and drives the streak +
-- activity heatmap, so it's cleared (not just `done` flipped) on undo.
create table if not exists quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  time text,
  xp int not null default 10,
  done boolean not null default false,
  quest_date date not null default current_date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists quests_user_quest_date_idx on quests (user_id, quest_date);
create index if not exists quests_user_completed_at_idx on quests (user_id, completed_at);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists tasks_user_id_idx on tasks (user_id);

-- LEGACY: flat skill percentages from the first MVP. No longer read by the
-- app (replaced by skill_trees/skill_nodes + xp_events below); kept so
-- existing projects don't lose data.
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'Circle',
  percent int not null default 0 check (percent between 0 and 100),
  color text not null default 'blue' check (color in ('green', 'blue', 'purple', 'orange')),
  sort_order int not null default 0
);
create index if not exists skills_user_id_idx on skills (user_id);

-- Free-form stat cards (Training, Nutrition, Sleep Goal, etc.) shown next to
-- the always-computed "Quest Score" card. No built-in set — insert your own
-- rows once you're logged in.
create table if not exists stat_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  icon text not null default 'Circle',
  value text not null,
  unit text,
  sub text,
  percent int not null default 0 check (percent between 0 and 100),
  color text not null default 'blue' check (color in ('green', 'blue', 'purple', 'orange')),
  sort_order int not null default 0
);
create index if not exists stat_cards_user_id_idx on stat_cards (user_id);

alter table profile enable row level security;
alter table quests enable row level security;
alter table tasks enable row level security;
alter table skills enable row level security;
alter table stat_cards enable row level security;

create policy "select own profile" on profile for select using (auth.uid() = user_id);
create policy "insert own profile" on profile for insert with check (auth.uid() = user_id);
create policy "update own profile" on profile for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "select own quests" on quests for select using (auth.uid() = user_id);
create policy "insert own quests" on quests for insert with check (auth.uid() = user_id);
create policy "update own quests" on quests for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own quests" on quests for delete using (auth.uid() = user_id);

create policy "select own tasks" on tasks for select using (auth.uid() = user_id);
create policy "insert own tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "update own tasks" on tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own tasks" on tasks for delete using (auth.uid() = user_id);

-- skills/stat_cards have no app-level insert/update/delete UI yet — they're
-- seeded manually per-user today, so only read policies exist for now. Add
-- write policies here once the app gains editing UI for them.
create policy "select own skills" on skills for select using (auth.uid() = user_id);
create policy "select own stat_cards" on stat_cards for select using (auth.uid() = user_id);

-- Auto-provision a profile row the moment a new auth.users row is created,
-- so getProfile() never races an empty table right after sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profile (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'You'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Skill trees, XP ledger, MCP API tokens (same as migrations/001).
-- ---------------------------------------------------------------------------
-- A user's skill tree (Coding, Guitar, Spanish, ...). Usually generated by
-- Claude over MCP, so `source` records where it came from.
create table if not exists skill_trees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  icon text not null default 'TreeDeciduous',
  color text not null default 'green' check (color in ('green', 'blue', 'purple', 'orange')),
  source text not null default 'manual' check (source in ('manual', 'mcp')),
  created_at timestamptz not null default now()
);
create index if not exists skill_trees_user_id_idx on skill_trees (user_id);

-- One perk/skill in a tree. `tier` is the node's depth (0 = root), derived
-- from its prerequisites when the tree is written. A node is complete once
-- its earned XP (from xp_events) reaches xp_required. `maintenance_days`
-- (optional) marks it "rusty" when not practiced for that many days.
create table if not exists skill_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tree_id uuid not null references skill_trees(id) on delete cascade,
  name text not null,
  description text not null default '',
  icon text not null default 'Circle',
  xp_required int not null default 100 check (xp_required between 1 and 100000),
  tier int not null default 0 check (tier >= 0),
  position int not null default 0,
  maintenance_days int check (maintenance_days is null or maintenance_days between 1 and 365),
  created_at timestamptz not null default now()
);
create index if not exists skill_nodes_tree_id_idx on skill_nodes (tree_id);
create index if not exists skill_nodes_user_id_idx on skill_nodes (user_id);

-- Prerequisite edges: `node_id` unlocks once every `prereq_id` is complete.
create table if not exists skill_node_prereqs (
  node_id uuid not null references skill_nodes(id) on delete cascade,
  prereq_id uuid not null references skill_nodes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (node_id, prereq_id),
  check (node_id <> prereq_id)
);
create index if not exists skill_node_prereqs_user_id_idx on skill_node_prereqs (user_id);

-- Quests can train a specific skill node.
alter table quests add column if not exists skill_node_id uuid references skill_nodes(id) on delete set null;

-- XP ledger: the single source of truth for level and skill progress.
-- Completing a quest inserts one row (quest_id set, unique); un-completing
-- or deleting the quest removes it. Activity logged over MCP has no quest.
create table if not exists xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null check (amount between 1 and 10000),
  source text not null check (source in ('quest', 'mcp', 'manual')),
  quest_id uuid unique references quests(id) on delete cascade,
  skill_node_id uuid references skill_nodes(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists xp_events_user_created_idx on xp_events (user_id, created_at);
create index if not exists xp_events_node_idx on xp_events (skill_node_id);

-- Personal access tokens for the MCP endpoint (/api/mcp). Only a SHA-256
-- hash is stored; the plain token is shown once when created.
create table if not exists api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists api_tokens_user_id_idx on api_tokens (user_id);

alter table skill_trees enable row level security;
alter table skill_nodes enable row level security;
alter table skill_node_prereqs enable row level security;
alter table xp_events enable row level security;
alter table api_tokens enable row level security;

-- Full CRUD on own rows. (The MCP endpoint uses the service-role key and
-- scopes every query by the token's user_id in application code.)
do $$
declare t text;
begin
  foreach t in array array['skill_trees', 'skill_nodes', 'skill_node_prereqs', 'xp_events'] loop
    execute format('drop policy if exists "own rows" on %I', t);
    execute format(
      'create policy "own rows" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t
    );
  end loop;
end $$;

-- Tokens: users can create, list and revoke their own. No update policy:
-- last_used_at is only written by the server with the service-role key.
drop policy if exists "select own api_tokens" on api_tokens;
drop policy if exists "insert own api_tokens" on api_tokens;
drop policy if exists "delete own api_tokens" on api_tokens;
create policy "select own api_tokens" on api_tokens for select using (auth.uid() = user_id);
create policy "insert own api_tokens" on api_tokens for insert with check (auth.uid() = user_id);
create policy "delete own api_tokens" on api_tokens for delete using (auth.uid() = user_id);

-- Backfill: quests completed before the ledger existed earn their XP, so
-- switching to ledger-derived levels doesn't reset anyone to level 1.
-- Idempotent via the unique quest_id.
insert into xp_events (user_id, amount, source, quest_id, skill_node_id, created_at)
select user_id, greatest(1, least(xp, 10000)), 'quest', id, skill_node_id, completed_at
from quests
where done and completed_at is not null
on conflict (quest_id) do nothing;

-- Aggregates run in Postgres, not by fetching rows: PostgREST caps plain
-- selects (1000 rows by default), which would silently truncate totals.
-- SECURITY INVOKER keeps RLS in force for signed-in callers, so passing
-- another user's id returns nothing; the service role (MCP) bypasses RLS
-- and relies on the id it resolved from the API token.

-- XP per skill node (skill_node_id null = XP not tied to a node).
create or replace function xp_summary(p_user_id uuid)
returns table (skill_node_id uuid, total bigint, last_at timestamptz)
language sql stable security invoker set search_path = public
as $$
  select skill_node_id, sum(amount)::bigint, max(created_at)
  from xp_events
  where user_id = p_user_id
  group by skill_node_id
$$;

-- Completed quests per UTC day since p_since, for the activity heatmap.
create or replace function activity_counts(p_user_id uuid, p_since timestamptz)
returns table (day date, completed bigint)
language sql stable security invoker set search_path = public
as $$
  select (completed_at at time zone 'utc')::date, count(*)::bigint
  from quests
  where user_id = p_user_id and done and completed_at >= p_since
  group by 1
$$;

-- Quest stats (see supabase/migrations/002_quest_stats.sql)
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

-- Custom avatar (see supabase/migrations/003_profile_avatar.sql)
alter table profile add column if not exists avatar jsonb;

-- Dailies, boss, achievements, login rewards, public card (see supabase/migrations/004_dailies_bosses_rewards.sql)

-- More XP sources: login rewards, boss kills, achievements.
alter table xp_events drop constraint if exists xp_events_source_check;
alter table xp_events add constraint xp_events_source_check
  check (source in ('quest', 'mcp', 'manual', 'login', 'boss', 'achievement'));

-- Dailies: a habit repeats on chosen weekdays (0 = Sunday ... 6 = Saturday).
-- The app creates each day's quest from its habits on first load that day.
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  xp int not null default 10 check (xp between 1 and 1000),
  stat text check (stat in ('str', 'int', 'dex', 'wis', 'cha')),
  skill_node_id uuid references skill_nodes(id) on delete set null,
  weekdays int[] not null default '{0,1,2,3,4,5,6}',
  time text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists habits_user_id_idx on habits (user_id);

alter table quests add column if not exists habit_id uuid references habits(id) on delete set null;
-- One quest per habit per day (NULL habit_id rows are never considered equal).
create unique index if not exists quests_habit_day_uniq on quests (habit_id, quest_date);

-- Weekly boss: all XP earned during the week damages it.
create table if not exists bosses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  name text not null,
  hp int not null check (hp between 50 and 100000),
  reward_xp int not null default 100 check (reward_xp between 0 and 10000),
  defeated_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

-- Unlocked achievements (definitions live in code, lib/achievements.ts).
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, key)
);

-- One claim per user per day; cycle_day is 1..7 in the repeating reward calendar.
create table if not exists login_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  claim_date date not null,
  cycle_day int not null check (cycle_day between 1 and 7),
  xp int not null check (xp >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, claim_date)
);

alter table profile add column if not exists title_key text;
alter table profile add column if not exists public_slug text;
alter table profile add column if not exists is_public boolean not null default false;
create unique index if not exists profile_public_slug_uniq on profile (lower(public_slug)) where public_slug is not null;

alter table habits enable row level security;
alter table bosses enable row level security;
alter table achievements enable row level security;
alter table login_claims enable row level security;

do $$
declare t text;
begin
  foreach t in array array['habits', 'bosses', 'achievements', 'login_claims'] loop
    execute format('drop policy if exists "own rows" on %I', t);
    execute format(
      'create policy "own rows" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t
    );
  end loop;
end $$;

-- XP earned from real work (not login/boss/achievement bonuses) since a moment.
-- Used for boss damage so rewards can't feed back into the boss.
create or replace function xp_since(p_user_id uuid, p_since timestamptz)
returns bigint
language sql stable security invoker set search_path = public
as $$
  select coalesce(sum(amount), 0)::bigint
  from xp_events
  where user_id = p_user_id and created_at >= p_since and source in ('quest', 'mcp', 'manual')
$$;
