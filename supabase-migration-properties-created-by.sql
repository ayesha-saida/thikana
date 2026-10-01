-- ============================================
-- Track which admin uploaded each property
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Add uploader column (stores Supabase auth user id, same as users.clerk_id).
--    Existing rows get NULL (uploader unknown for old Clerk-era listings).
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS created_by text
  REFERENCES users(clerk_id) ON DELETE SET NULL;

-- 2. Speeds up the "My Listings" query on the profile
CREATE INDEX IF NOT EXISTS idx_properties_created_by
  ON properties(created_by);
