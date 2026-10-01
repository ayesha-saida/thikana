-- ============================================
-- Storage bucket for profile avatars
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Create public avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Anyone can read avatars (public profile photos)
create policy "Public can read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- 3. Signed-in users can upload into their own folder (path = {user_id}/...)
create policy "Users can upload own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Signed-in users can replace/delete their own avatar
create policy "Users can update own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own avatar"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
