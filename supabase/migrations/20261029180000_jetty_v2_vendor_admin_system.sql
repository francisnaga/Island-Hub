-- ============================================================================
-- JETTY V2: VENDOR SYSTEM, ADMIN CONTROLS, BANNED ARCHIVING & MOCK DATA SEED
-- ============================================================================

-- 1. Extend profiles table
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;

-- 2. Extend vendors table with v2 storefront, seller type, pause, featured, and analytics fields
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS seller_type text DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS business_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS campus text DEFAULT 'Okerenkoko',
  ADD COLUMN IF NOT EXISTS opening_hours text DEFAULT 'Mon–Sat, 8:00 AM – 7:00 PM',
  ADD COLUMN IF NOT EXISTS is_paused boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pause_reason text,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_clicks integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS store_views integer DEFAULT 0;

-- 3. Extend products table with listing_type (product, food, service), featured, and archived status
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_status_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_status_check
  CHECK (status = ANY (ARRAY['pending_review'::text, 'approved'::text, 'rejected'::text, 'suspended'::text, 'archived'::text]));

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS listing_type text DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_clicks integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_turnaround text,
  ADD COLUMN IF NOT EXISTS service_area text,
  ADD COLUMN IF NOT EXISTS food_lead_time text,
  ADD COLUMN IF NOT EXISTS food_allergen_info text;

-- 4. Helper function to check if current user is Jetty Admin (by role OR efobifrancis53@gmail.com)
CREATE OR REPLACE FUNCTION public.is_jetty_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'efobifrancis53@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- 5. Trigger to auto-create/sync profile on auth.users signup/login and auto-promote efobifrancis53@gmail.com
CREATE OR REPLACE FUNCTION public.handle_jetty_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assigned_role text;
BEGIN
  IF LOWER(COALESCE(NEW.email, '')) = 'efobifrancis53@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'vendor';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, avatar_url, role, active_mode)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1), 'Jetty Vendor'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'),
    assigned_role,
    'vendor'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    role = CASE
      WHEN LOWER(COALESCE(EXCLUDED.email, '')) = 'efobifrancis53@gmail.com' THEN 'admin'
      ELSE public.profiles.role
    END,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_jetty ON auth.users;
CREATE TRIGGER on_auth_user_created_jetty
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_jetty_auth_user();

-- Promote efobifrancis53@gmail.com if already in profiles or auth.users
UPDATE public.profiles
SET role = 'admin'
WHERE LOWER(COALESCE(email, '')) = 'efobifrancis53@gmail.com';

-- 6. Update RLS policies so Admin (efobifrancis53@gmail.com) has full control and banned vendors remain viewable as 'Banned' when searched
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_jetty_admin());

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_jetty_admin());

DROP POLICY IF EXISTS "Admins can delete profiles." ON public.profiles;
CREATE POLICY "Admins can delete profiles."
  ON public.profiles FOR DELETE
  USING (public.is_jetty_admin());

DROP POLICY IF EXISTS "Only admins can manage categories." ON public.categories;
CREATE POLICY "Only admins can manage categories."
  ON public.categories FOR ALL
  USING (public.is_jetty_admin());

DROP POLICY IF EXISTS "Public can view non-suspended vendors." ON public.vendors;
DROP POLICY IF EXISTS "Public can view vendors." ON public.vendors;
CREATE POLICY "Public can view vendors."
  ON public.vendors FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can apply as a vendor." ON public.vendors;
CREATE POLICY "Authenticated users can apply as a vendor."
  ON public.vendors FOR INSERT
  WITH CHECK ((auth.uid() = user_id) OR public.is_jetty_admin());

DROP POLICY IF EXISTS "Vendors can update their own storefront or admins can moderate." ON public.vendors;
CREATE POLICY "Vendors can update their own storefront or admins can moderate."
  ON public.vendors FOR UPDATE
  USING ((auth.uid() = user_id) OR public.is_jetty_admin());

DROP POLICY IF EXISTS "Admins can delete vendors." ON public.vendors;
CREATE POLICY "Admins can delete vendors."
  ON public.vendors FOR DELETE
  USING (public.is_jetty_admin());

DROP POLICY IF EXISTS "Public can view approved products; owners and admins can view a" ON public.products;
DROP POLICY IF EXISTS "Public can view approved products; owners and admins can view all." ON public.products;
CREATE POLICY "Public can view approved products; owners and admins can view all."
  ON public.products FOR SELECT
  USING (
    status = 'approved'
    OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = products.vendor_id AND v.user_id = auth.uid())
    OR public.is_jetty_admin()
  );

DROP POLICY IF EXISTS "Vendors can insert products for their own shop." ON public.products;
CREATE POLICY "Vendors can insert products for their own shop."
  ON public.products FOR INSERT
  WITH CHECK (
    (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = products.vendor_id AND v.user_id = auth.uid() AND v.verification_status <> 'suspended'))
    OR public.is_jetty_admin()
  );

DROP POLICY IF EXISTS "Vendors can update own products; admins can moderate." ON public.products;
CREATE POLICY "Vendors can update own products; admins can moderate."
  ON public.products FOR UPDATE
  USING (
    (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = products.vendor_id AND v.user_id = auth.uid()))
    OR public.is_jetty_admin()
  );

DROP POLICY IF EXISTS "Vendors can delete own products; admins can delete any." ON public.products;
CREATE POLICY "Vendors can delete own products; admins can delete any."
  ON public.products FOR DELETE
  USING (
    (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = products.vendor_id AND v.user_id = auth.uid()))
    OR public.is_jetty_admin()
  );

DROP POLICY IF EXISTS "Only admins can view and manage reports." ON public.reports;
CREATE POLICY "Only admins can view and manage reports."
  ON public.reports FOR SELECT
  USING (public.is_jetty_admin());

DROP POLICY IF EXISTS "Only admins can update reports." ON public.reports;
CREATE POLICY "Only admins can update reports."
  ON public.reports FOR UPDATE
  USING (public.is_jetty_admin());

DROP POLICY IF EXISTS "Only admins can view and insert moderation logs." ON public.moderation_logs;
CREATE POLICY "Only admins can view and insert moderation logs."
  ON public.moderation_logs FOR ALL
  USING (public.is_jetty_admin());
