-- CyberEscape admin setup
-- Run this after schema.sql and rls.sql are applied.
--
-- Admin identity values:
--   full_name : CyberEscape Admin
--   email     : admin@cyberescape.local
--   username  : admin
--
-- Important:
-- The password must be created in Supabase Auth for the matching user.
-- This file only syncs the public.profiles row.

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

do $$
declare
  v_user_id uuid;
begin
  select id
    into v_user_id
  from auth.users
  where lower(email) = lower('admin@cyberescape.local')
  limit 1;

  if v_user_id is null then
    raise notice 'No Supabase Auth user found for admin@cyberescape.local. Create the Auth user first, then re-run this file.';
  else
    perform public.create_admin_profile(
      v_user_id,
      'CyberEscape Admin',
      'admin@cyberescape.local',
      'admin'
    );
    raise notice 'Admin profile synced for %', v_user_id;
  end if;
end;
$$;

-- Password setup:
-- Set the admin password in Supabase Auth for the same user.
