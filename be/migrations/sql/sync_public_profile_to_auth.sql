-- Run in Supabase Dashboard → SQL Editor after `on_auth_user_created.sql`.
-- Keeps auth.users metadata in sync when the app updates public.users (e.g. PATCH /user/profile).
--
-- Covers:
--   • public.users.full_name → auth.users.raw_user_meta_data (name, full_name) merged with existing JSON
--
-- Profile phone stays only on public.profiles.mobile_number (no auth.users.phone sync).
--
-- Caveats:
--   1) JWT user_metadata is baked into the access token until refresh — clients may need
--      supabase.auth.refreshSession() (or re-login) to see updated name in the token.
--   2) If you later add triggers that copy auth.users → public.users on UPDATE, add loop guards
--      (e.g. only update when values differ, or use a session flag).

create or replace function public.sync_auth_user_metadata_from_public_users()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.full_name is distinct from old.full_name then
    update auth.users
    set
      raw_user_meta_data = coalesce(auth.users.raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object(
          'name', new.full_name,
          'full_name', new.full_name
        ),
      updated_at = now()
    where auth.users.id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_public_users_full_name_sync_auth on public.users;

create trigger trg_public_users_full_name_sync_auth
  after update of full_name on public.users
  for each row
  execute function public.sync_auth_user_metadata_from_public_users();

