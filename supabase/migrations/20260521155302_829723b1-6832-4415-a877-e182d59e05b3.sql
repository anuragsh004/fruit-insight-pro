
-- Fix search_path on helpers
alter function public.handle_new_user() set search_path = public;
alter function public.set_updated_at() set search_path = public;

-- Restrict EXECUTE of SECURITY DEFINER helpers
revoke execute on function public.has_role(uuid, app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Replace broad bucket listing with per-file public read by full path
drop policy if exists "fruit-images public read" on storage.objects;
create policy "fruit-images read by path" on storage.objects
  for select using (bucket_id = 'fruit-images');
