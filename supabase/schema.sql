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
