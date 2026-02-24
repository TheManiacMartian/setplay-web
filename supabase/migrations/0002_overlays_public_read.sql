-- Ensure overlays and match_state are publicly readable (for OBS browser source)
drop policy if exists "overlays: public read" on public.overlays;
create policy "overlays: public read" on public.overlays for select using (true);

drop policy if exists "match_state: public read" on public.match_state;
create policy "match_state: public read" on public.match_state for select using (true);
