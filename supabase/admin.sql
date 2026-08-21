-- CyberEscape admin setup
-- Run this after schema.sql and rls.sql are applied.
-- Replace the placeholder values before executing in Supabase SQL editor.

-- Optional helper: create an admin profile row for an existing Supabase Auth user.
-- Usage:
--   select public.create_admin_profile(
--     '00000000-0000-0000-0000-000000000000',
--     'CyberEscape Admin',
--     'admin@cyberescape.local',
--     'admin'
--   );

create or replace function public.create_admin_profile(
  p_user_id uuid,
  p_full_name text,
  p_email text,
  p_username text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    username,
    role,
    status,
    created_at,
    updated_at
  )
  values (
    p_user_id,
    p_full_name,
    p_email,
    p_username,
    'admin',
    'active',
    now(),
    now()
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        username = excluded.username,
        role = 'admin',
        status = 'active',
        updated_at = now();
end;
$$;

comment on function public.create_admin_profile is
'Creates or updates an admin profile row for a Supabase Auth user.';

-- Example maintenance query:
-- select public.create_admin_profile(
--   'YOUR-USER-UUID-HERE',
--   'CyberEscape Admin',
--   'admin@cyberescape.local',
--   'admin'
-- );
