-- ============================================================
-- MIGRATION: Edit Listing + Manage Users
-- Run in: Supabase Dashboard → SQL Editor  (run once)
-- ============================================================

-- 1. Helper: is the current caller an admin?
--    SECURITY DEFINER so policies can read `users` without recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users
     WHERE clerk_id = auth.jwt()->>'sub'),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 2. Admins can see every registered user (Manage Users page).
--    Regular users keep their existing own-row policy.
DROP POLICY IF EXISTS "admins_read_users" ON public.users;
CREATE POLICY "admins_read_users" ON public.users
  FOR SELECT USING (public.is_admin());

-- 3. Admins can update any user's row (the admin/role toggle).
DROP POLICY IF EXISTS "admins_update_users" ON public.users;
CREATE POLICY "admins_update_users" ON public.users
  FOR UPDATE USING (public.is_admin()) WITH CHECK (true);

-- 4. Only the owner (or an admin) may edit a property.
--    Old Clerk-era rows have created_by = NULL → only admins can edit those.
DROP POLICY IF EXISTS "owner_or_admin_update_properties" ON public.properties;
CREATE POLICY "owner_or_admin_update_properties" ON public.properties
  FOR UPDATE
  USING (created_by = auth.jwt()->>'sub' OR public.is_admin())
  WITH CHECK (created_by = auth.jwt()->>'sub' OR public.is_admin());

-- 5. Only the owner (or an admin) may delete a property.
DROP POLICY IF EXISTS "owner_or_admin_delete_properties" ON public.properties;
CREATE POLICY "owner_or_admin_delete_properties" ON public.properties
  FOR DELETE
  USING (created_by = auth.jwt()->>'sub' OR public.is_admin());

-- 6. Guard: non-admins can update their own row (for the avatar),
--    but they must NEVER be able to flip is_admin on it — otherwise
--    anyone could promote themselves to admin.
CREATE OR REPLACE FUNCTION public.guard_admin_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change admin permissions';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_users_admin ON public.users;
CREATE TRIGGER guard_users_admin
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.guard_admin_change();

-- 7. Only admins may add properties (the "Add Property" tab is admin-only).
--    Applies only to signed-in app users (role = 'authenticated');
--    dashboard, service role and scripts are unaffected. RLS still
--    applies on top for API clients.
CREATE OR REPLACE FUNCTION public.guard_property_insert()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF COALESCE(auth.jwt()->>'role', '') = 'authenticated'
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can add properties';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_property_insert ON public.properties;
CREATE TRIGGER guard_property_insert
  BEFORE INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.guard_property_insert();

-- ============================================================
-- 8. Verification (optional)
-- ============================================================
-- SELECT email, is_admin FROM users ORDER BY created_at DESC;
-- SELECT schemaname, tablename, policyname, cmd
--   FROM pg_policies
--  WHERE tablename IN ('users', 'properties')
--  ORDER BY tablename, policyname;
