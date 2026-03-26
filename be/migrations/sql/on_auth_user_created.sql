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
  fn text;
  ln text;
  full_n text;
begin
  fn := coalesce(nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''), '');
  ln := coalesce(nullif(trim(new.raw_user_meta_data ->> 'last_name'), ''), '');
  full_n := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
  if fn = '' and full_n is not null then
    fn := split_part(full_n, ' ', 1);
    ln := case
      when strpos(full_n, ' ') > 0 then trim(substring(full_n from strpos(full_n, ' ') + 1))
      else ''
    end;
  end if;
  if fn = '' then
    fn := 'User';
  end if;

  insert into public.users (id, email, first_name, last_name, created_at, updated_at)
  values (
    new.id,
    coalesce(new.email, ''),
    fn,
    ln,
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
