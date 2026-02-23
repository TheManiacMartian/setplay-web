-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Overlays
create table public.overlays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  layout_config jsonb not null default '{"primaryColor":"#ffffff","secondaryColor":"#000000","fontFamily":"sans-serif"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Match state (one row per overlay)
create table public.match_state (
  id uuid primary key default gen_random_uuid(),
  overlay_id uuid not null unique references public.overlays(id) on delete cascade,
  player1_name text not null default '',
  player1_character text not null default '',
  player1_score int not null default 0,
  player2_name text not null default '',
  player2_character text not null default '',
  player2_score int not null default 0,
  round text not null default '',
  updated_at timestamptz not null default now()
);

-- Auto-create match_state row when an overlay is created
create or replace function public.handle_new_overlay()
returns trigger as $$
begin
  insert into public.match_state (overlay_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_overlay_created
  after insert on public.overlays
  for each row execute procedure public.handle_new_overlay();

-- Updated_at helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger overlays_updated_at
  before update on public.overlays
  for each row execute procedure public.set_updated_at();

create trigger match_state_updated_at
  before update on public.match_state
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.overlays enable row level security;
alter table public.match_state enable row level security;

-- Profiles: users can read/update their own
create policy "profiles: own read" on public.profiles for select using (auth.uid() = id);
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);

-- Overlays: owner full access, public read
create policy "overlays: owner all" on public.overlays for all using (auth.uid() = user_id);
create policy "overlays: public read" on public.overlays for select using (true);

-- Match state: owner update, public read
create policy "match_state: owner update" on public.match_state
  for all using (
    exists (
      select 1 from public.overlays
      where overlays.id = match_state.overlay_id
        and overlays.user_id = auth.uid()
    )
  );
create policy "match_state: public read" on public.match_state for select using (true);

-- Storage bucket for logos (run in Supabase dashboard or via CLI)
-- insert into storage.buckets (id, name, public) values ('logos', 'logos', true);
