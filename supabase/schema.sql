-- CyberEscape backend schema for Supabase PostgreSQL
-- Apply this before rls.sql, seed.sql, and admin.sql.

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('admin', 'teacher', 'student');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.account_status as enum ('active', 'inactive', 'suspended');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.room_status as enum ('active', 'inactive');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.progress_status as enum ('locked', 'available', 'in_progress', 'completed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.puzzle_status as enum ('active', 'inactive');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.clue_type as enum ('text', 'image', 'object', 'file', 'message', 'system_log', 'email', 'code');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.session_status as enum ('active', 'paused', 'completed', 'abandoned');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  username text not null unique,
  role public.user_role not null,
  status public.account_status not null default 'active',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login timestamptz
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  student_number text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  employee_number text,
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_number int not null unique,
  title text not null,
  topic text not null,
  difficulty text not null,
  objective text not null,
  scenario text not null,
  instructions text not null,
  order_number int not null unique,
  status public.room_status not null default 'active',
  background_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_room_number_positive check (room_number > 0),
  constraint rooms_order_number_positive check (order_number > 0)
);

create table if not exists public.puzzles (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  title text not null,
  puzzle_type text not null,
  question text not null,
  instructions text not null,
  base_score int not null default 1000,
  attempt_penalty int not null default 50,
  order_number int not null default 1,
  status public.puzzle_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint puzzles_base_score_nonnegative check (base_score >= 0),
  constraint puzzles_attempt_penalty_nonnegative check (attempt_penalty >= 0),
  constraint puzzles_order_number_positive check (order_number > 0)
);

create table if not exists public.puzzle_options (
  id uuid primary key default gen_random_uuid(),
  puzzle_id uuid not null references public.puzzles(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_number int not null default 1,
  unique (puzzle_id, order_number)
);

create table if not exists public.validation_rules (
  id uuid primary key default gen_random_uuid(),
  puzzle_id uuid not null references public.puzzles(id) on delete cascade,
  rule_type text not null,
  rule_key text not null,
  rule_value text not null,
  rule_order int not null default 1,
  unique (puzzle_id, rule_order)
);

create table if not exists public.hints (
  id uuid primary key default gen_random_uuid(),
  puzzle_id uuid not null references public.puzzles(id) on delete cascade,
  hint_number int not null,
  hint_text text not null,
  score_penalty int not null default 25,
  unique (puzzle_id, hint_number),
  constraint hints_score_penalty_nonnegative check (score_penalty >= 0)
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  puzzle_id uuid not null references public.puzzles(id) on delete cascade,
  submitted_answer text not null,
  attempt_number int not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  unique (student_id, puzzle_id, attempt_number)
);

create table if not exists public.room_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  status public.progress_status not null default 'locked',
  score int not null default 0,
  attempts int not null default 0,
  hints_used int not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  unique(student_id, room_id),
  constraint room_progress_score_nonnegative check (score >= 0),
  constraint room_progress_attempts_nonnegative check (attempts >= 0),
  constraint room_progress_hints_nonnegative check (hints_used >= 0)
);

create table if not exists public.puzzle_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  puzzle_id uuid not null references public.puzzles(id) on delete cascade,
  status public.progress_status not null default 'locked',
  score int not null default 0,
  attempts int not null default 0,
  hints_used int not null default 0,
  completed_at timestamptz,
  unique(student_id, puzzle_id),
  constraint puzzle_progress_score_nonnegative check (score >= 0),
  constraint puzzle_progress_attempts_nonnegative check (attempts >= 0),
  constraint puzzle_progress_hints_nonnegative check (hints_used >= 0)
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  score int not null default 0,
  completion_time interval,
  created_at timestamptz not null default now(),
  constraint scores_nonnegative check (score >= 0)
);

create table if not exists public.clues (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  puzzle_id uuid references public.puzzles(id) on delete cascade,
  title text not null,
  description text not null,
  clue_type public.clue_type not null default 'text',
  asset_url text
);

create table if not exists public.clue_discoveries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  clue_id uuid not null references public.clues(id) on delete cascade,
  discovered_at timestamptz not null default now(),
  unique(student_id, clue_id)
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  name text not null,
  description text not null,
  item_type text not null,
  asset_url text
);

create table if not exists public.student_inventory (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  collected_at timestamptz not null default now(),
  used_at timestamptz,
  unique(student_id, item_id)
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon text not null,
  condition_type text not null,
  condition_value text not null
);

create table if not exists public.student_achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(student_id, achievement_id)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  puzzle_id uuid not null references public.puzzles(id) on delete cascade,
  title text not null,
  content text not null
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  current_room_id uuid references public.rooms(id) on delete set null,
  started_at timestamptz not null default now(),
  last_activity timestamptz not null default now(),
  ended_at timestamptz,
  status public.session_status not null default 'active'
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  audience text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  module text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_rooms_order_number on public.rooms(order_number);
create index if not exists idx_rooms_status on public.rooms(status);
create index if not exists idx_puzzles_room_id on public.puzzles(room_id);
create index if not exists idx_puzzles_status on public.puzzles(status);
create index if not exists idx_attempts_student_id on public.attempts(student_id);
create index if not exists idx_attempts_puzzle_id on public.attempts(puzzle_id);
create index if not exists idx_room_progress_student_id on public.room_progress(student_id);
create index if not exists idx_room_progress_room_id on public.room_progress(room_id);
create index if not exists idx_puzzle_progress_student_id on public.puzzle_progress(student_id);
create index if not exists idx_puzzle_progress_puzzle_id on public.puzzle_progress(puzzle_id);
create index if not exists idx_scores_student_id on public.scores(student_id);
create index if not exists idx_scores_room_id on public.scores(room_id);
create index if not exists idx_game_sessions_student_id on public.game_sessions(student_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_announcements_created_by on public.announcements(created_by);
create index if not exists idx_activity_logs_user_id on public.activity_logs(user_id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_rooms_updated_at on public.rooms;
create trigger trg_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists trg_puzzles_updated_at on public.puzzles;
create trigger trg_puzzles_updated_at
before update on public.puzzles
for each row execute function public.set_updated_at();
