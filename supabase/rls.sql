-- CyberEscape Phase 2: row level security policies

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.rooms enable row level security;
alter table public.puzzles enable row level security;
alter table public.puzzle_options enable row level security;
alter table public.validation_rules enable row level security;
alter table public.hints enable row level security;
alter table public.attempts enable row level security;
alter table public.room_progress enable row level security;
alter table public.puzzle_progress enable row level security;
alter table public.scores enable row level security;
alter table public.clues enable row level security;
alter table public.clue_discoveries enable row level security;
alter table public.inventory_items enable row level security;
alter table public.student_inventory enable row level security;
alter table public.achievements enable row level security;
alter table public.student_achievements enable row level security;
alter table public.lessons enable row level security;
alter table public.game_sessions enable row level security;
alter table public.notifications enable row level security;
alter table public.announcements enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles self read" on public.profiles
for select using (auth.uid() = id);

create policy "profiles admin full access" on public.profiles
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "students own data" on public.students
for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.id = profile_id))
);

create policy "teachers own data" on public.teachers
for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.id = profile_id))
);

create policy "game content read" on public.rooms
for select using (true);

create policy "game content read puzzles" on public.puzzles
for select using (true);
create policy "game content read options" on public.puzzle_options
for select using (true);
create policy "game content read rules" on public.validation_rules
for select using (true);
create policy "game content read hints" on public.hints
for select using (true);
create policy "game content read clues" on public.clues
for select using (true);
create policy "game content read inventory" on public.inventory_items
for select using (true);
create policy "game content read lessons" on public.lessons
for select using (true);
create policy "game content read achievements" on public.achievements
for select using (true);

create policy "student own progress" on public.room_progress
for select using (
  exists (
    select 1 from public.students s
    join public.profiles p on p.id = s.profile_id
    where s.id = student_id and (p.id = auth.uid() or p.role = 'admin')
  )
);

create policy "student own puzzle progress" on public.puzzle_progress
for select using (
  exists (
    select 1 from public.students s
    join public.profiles p on p.id = s.profile_id
    where s.id = student_id and (p.id = auth.uid() or p.role = 'admin')
  )
);

create policy "student own attempts" on public.attempts
for select using (
  exists (
    select 1 from public.students s
    join public.profiles p on p.id = s.profile_id
    where s.id = student_id and (p.id = auth.uid() or p.role in ('admin', 'teacher'))
  )
);

create policy "student own scores" on public.scores
for select using (
  exists (
    select 1 from public.students s
    join public.profiles p on p.id = s.profile_id
    where s.id = student_id and (p.id = auth.uid() or p.role in ('admin', 'teacher'))
  )
);

create policy "student own inventory" on public.student_inventory
for select using (
  exists (
    select 1 from public.students s
    join public.profiles p on p.id = s.profile_id
    where s.id = student_id and (p.id = auth.uid() or p.role = 'admin')
  )
);

create policy "student own achievements" on public.student_achievements
for select using (
  exists (
    select 1 from public.students s
    join public.profiles p on p.id = s.profile_id
    where s.id = student_id and (p.id = auth.uid() or p.role in ('admin', 'teacher'))
  )
);

create policy "teacher read progress" on public.room_progress
for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'teacher'))
);

create policy "teacher read puzzle progress" on public.puzzle_progress
for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'teacher'))
);

create policy "teacher read sessions" on public.game_sessions
for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'teacher'))
);

create policy "admin manage everything" on public.activity_logs
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

