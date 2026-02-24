-- Fix realtime: overlay_id is not the PK, so Postgres only writes the PK to
-- the WAL by default. FULL replica identity writes every column, which lets
-- Supabase filter postgres_changes events by overlay_id correctly.
alter table public.match_state replica identity full;

-- Ensure the logos bucket exists (safe to re-run)
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Storage RLS for logos bucket
-- Files are stored as {user_id}/{filename}, so the first folder component
-- must match the uploading user's UID.
create policy "logos: owner insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "logos: owner update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "logos: public select"
  on storage.objects for select
  using (bucket_id = 'logos');
