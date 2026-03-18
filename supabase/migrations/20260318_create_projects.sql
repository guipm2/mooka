-- Mooka: core projects table with row-level security.

create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('strategy', 'logo', 'mockup')),
  name text not null,
  data jsonb,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_created_at_idx on public.projects(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_set_updated_at on public.projects;
create trigger trg_projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

alter table public.projects enable row level security;

-- Read only own rows
drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
on public.projects
for select
using ((select auth.uid()) = user_id);

-- Insert only own rows
drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
on public.projects
for insert
with check ((select auth.uid()) = user_id);

-- Update only own rows
drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
on public.projects
for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Delete only own rows
drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
on public.projects
for delete
using ((select auth.uid()) = user_id);
