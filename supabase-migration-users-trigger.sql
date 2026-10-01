-- ============================================
-- MIGRATION: Clerk → Supabase Auth
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Auto-insert into public.users when a new auth user signs up
--    (SECURITY DEFINER: bypasses RLS, owner = postgres)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (clerk_id, email, first_name, last_name)
  VALUES (
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data ->> 'firstName',
    NEW.raw_user_meta_data ->> 'lastName'
  )
  ON CONFLICT (clerk_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Trigger: fires after each insert into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill: add any existing auth users missing from public.users
INSERT INTO public.users (clerk_id, email)
SELECT id::text, email FROM auth.users
WHERE email IS NOT NULL
  AND id::text NOT IN (SELECT clerk_id FROM public.users)
ON CONFLICT (clerk_id) DO NOTHING;

-- 4. Make yourself admin (replace with your registered email)
UPDATE users SET is_admin = true
WHERE clerk_id = (
  SELECT id::text FROM auth.users
  WHERE email = 'YOUR_EMAIL_HERE@example.com'
);

-- 5. Verification queries
SELECT email, created_at, confirmed_at FROM auth.users ORDER BY created_at DESC;
SELECT clerk_id, email, is_admin FROM users ORDER BY created_at DESC;
