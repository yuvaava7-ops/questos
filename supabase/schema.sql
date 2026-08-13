-- QuestOS — Supabase schema (MVP dashboard)
--
-- Single-user app: no auth, no per-row user_id. RLS is enabled with a
-- permissive "anon can do anything" policy purely so the anon key can't be
-- used for schema changes — it does NOT isolate data between users. If this
-- ever moves beyond a personal deployment, replace these policies with
-- auth.uid()-scoped ones (see docs/PROJECT_SCOPE.md's "Supabase Auth" phase).
--
-- Run this whole file once in the Supabase SQL editor for a fresh project.

create extension if not exists "pgcrypto";

-- Singleton row holding the logged-in user's identity/level/XP.
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
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
  label text not null,
  time text,
  xp int not null default 10,
  done boolean not null default false,
  quest_date date not null default current_date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists quests_quest_date_idx on quests (quest_date);
create index if not exists quests_completed_at_idx on quests (completed_at);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'Circle',
  percent int not null default 0 check (percent between 0 and 100),
  color text not null default 'blue' check (color in ('green', 'blue', 'purple', 'orange')),
  sort_order int not null default 0
);

-- Free-form stat cards (Training, Nutrition, Sleep Goal, etc.) shown next to
-- the always-computed "Quest Score" card. Insert your own rows — there's no
-- built-in set, so the dashboard starts empty until you add some.
create table if not exists stat_cards (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon text not null default 'Circle',
  value text not null,
  unit text,
  sub text,
  percent int not null default 0 check (percent between 0 and 100),
  color text not null default 'blue' check (color in ('green', 'blue', 'purple', 'orange')),
  sort_order int not null default 0
);

alter table profile enable row level security;
alter table quests enable row level security;
alter table tasks enable row level security;
alter table skills enable row level security;
alter table stat_cards enable row level security;

create policy "anon full access" on profile for all using (true) with check (true);
create policy "anon full access" on quests for all using (true) with check (true);
create policy "anon full access" on tasks for all using (true) with check (true);
create policy "anon full access" on skills for all using (true) with check (true);
create policy "anon full access" on stat_cards for all using (true) with check (true);

-- Seed your profile row (edit the values first) — the app reads the first
-- row it finds, so only ever keep one.
-- insert into profile (name, level, level_title, xp, xp_to_next_level)
-- values ('Yuval', 1, 'Novice', 0, 100);
