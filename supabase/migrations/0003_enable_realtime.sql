-- Enable Realtime for match_state so OBS browser sources update live
alter publication supabase_realtime add table public.match_state;
