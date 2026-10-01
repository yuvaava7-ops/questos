-- Dailies (recurring habits), weekly boss, achievements/titles, login rewards,
-- and the public hero card. Safe to re-run.

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
