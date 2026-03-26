-- Run this in Supabase Dashboard → SQL Editor after your public schema matches Alembic.
-- Creates `public.users` + `public.profiles` whenever a row is inserted into `auth.users`
-- so FastAPI only loads by JWT `sub` (no application-level sync).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text;
begin
  -- Google OAuth sets `name` in user_metadata; `full_name` covers other providers / manual metadata.
  full_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    'User'
  );

  insert into public.users (id, email, full_name, created_at, updated_at)
  values (
    new.id,
    coalesce(new.email, ''),
    full_name,
    now(),
    now()
  )
  on conflict (id) do nothing;

  insert into public.profiles (user_id, created_at, updated_at)
  values (new.id, now(), now())
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
