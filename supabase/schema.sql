-- =============================================================================
-- IslandHub Marketplace (NMU & Okerenkoko) — Clean Production Database Schema
-- =============================================================================
-- Core tables: profiles, categories, vendors, products, reports, moderation_logs
-- Enforces strict Row Level Security (RLS), role protection, and smart moderation.

-- 0. Clean up legacy tables if resetting an existing development database
DROP TABLE IF EXISTS public.moderation_logs CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- Drop legacy feature tables from v1
DROP TABLE IF EXISTS public.exchange_offers CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.saved_items CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.lost_found CASCADE;
DROP TABLE IF EXISTS public.request_replies CASCADE;
DROP TABLE IF EXISTS public.requests CASCADE;
DROP TABLE IF EXISTS public.marketplace_items CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'NMU Member',
  email TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'vendor', 'admin')),
  active_mode TEXT NOT NULL DEFAULT 'buyer' CHECK (active_mode IN ('buyer', 'vendor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Convert legacy user_role enum on profiles.role to TEXT and migrate 'student' -> 'buyer'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
    ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
    ALTER TABLE public.profiles ALTER COLUMN role TYPE TEXT USING role::TEXT;
    UPDATE public.profiles SET role = 'buyer' WHERE role = 'student' OR role IS NULL;
    ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'buyer';
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('buyer', 'vendor', 'admin'));
  END IF;
END $$;

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.verification_badge CASCADE;
DROP TYPE IF EXISTS public.lost_found_type CASCADE;

-- Ensure columns exist if upgrading an existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_mode TEXT NOT NULL DEFAULT 'buyer';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id AND role = 'buyer');

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Prevent non-admins from escalating their own role to 'admin'
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) IS DISTINCT FROM 'admin' THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- Automatically create/sync profile on Supabase Auth signup (Google OAuth & Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role, active_mode)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'NMU Member'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'buyer',
    'buyer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CATEGORIES TABLE
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Package',
  display_order INTEGER NOT NULL DEFAULT 1,
  is_priority BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone."
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories."
  ON public.categories FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Seed the 6 NMU Launch Categories
INSERT INTO public.categories (name, short_name, slug, description, icon, display_order, is_priority, is_active)
VALUES
  ('Maritime & Cadet Gear', 'Cadet gear', 'maritime-cadet-gear', 'Action rigs, safety boots, socks, uniform sets, headgear, belts, badges and other relevant student gear.', 'Anchor', 1, true, true),
  ('Fashion & Accessories', 'Footwear & Fashion', 'fashion-accessories', 'Everyday clothing, footwear, bags, watches and accessories.', 'Shirt', 2, false, true),
  ('Electronics & Gadgets', 'Electronics', 'electronics-gadgets', 'Chargers, earphones, phones, power banks, laptops and accessories.', 'Laptop', 3, false, true),
  ('Books & Stationery', 'Books', 'books-stationery', 'Textbooks, calculators, notebooks, drawing tools and other physical study supplies.', 'BookOpen', 4, false, true),
  ('Hostel & Daily Essentials', 'Hostel essentials', 'hostel-daily-essentials', 'Toiletries, bedding, storage items, buckets, cleaning supplies and basic household goods.', 'Home', 5, false, true),
  ('Food, Beauty & Other', 'More items', 'food-beauty-other', 'Snacks, drinks, grooming and personal-care products, plus an Other category for products that do not fit elsewhere.', 'Package', 6, false, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. VENDORS TABLE (Includes Location & Privacy Controls)
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  logo_url TEXT,
  whatsapp_number TEXT NOT NULL,
  categories_offered TEXT[] NOT NULL DEFAULT '{}',
  pickup_options TEXT NOT NULL DEFAULT 'Campus pickup by arrangement',
  delivery_available BOOLEAN NOT NULL DEFAULT false,
  delivery_coverage TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  rejection_reason TEXT,
  is_student BOOLEAN NOT NULL DEFAULT true,
  department_or_business_info TEXT,
  -- Vendor Location & Directions Fields
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_type TEXT NOT NULL DEFAULT 'pickup_point' CHECK (location_type IN ('shop', 'pickup_point', 'home_based', 'delivery_only')),
  location_visibility TEXT NOT NULL DEFAULT 'approximate' CHECK (location_visibility IN ('exact', 'approximate', 'hidden')),
  location_label TEXT NOT NULL DEFAULT 'NMU Okerenkoko Campus Area',
  location_confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendors_verification_status ON public.vendors(verification_status);
CREATE INDEX idx_vendors_slug ON public.vendors(slug);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view non-suspended vendors."
  ON public.vendors FOR SELECT USING (
    verification_status IN ('verified', 'pending')
    OR auth.uid() = user_id
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Authenticated users can apply as a vendor."
  ON public.vendors FOR INSERT WITH CHECK (
    auth.uid() = user_id AND verification_status = 'pending'
  );

CREATE POLICY "Vendors can update their own storefront or admins can moderate."
  ON public.vendors FOR UPDATE USING (
    auth.uid() = user_id
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Prevent vendors from approving their own verification_status
CREATE OR REPLACE FUNCTION public.protect_vendor_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) IS DISTINCT FROM 'admin' THEN
      NEW.verification_status := OLD.verification_status;
      NEW.rejection_reason := OLD.rejection_reason;
    ELSIF NEW.verification_status = 'verified' THEN
      -- Promote user profile role to vendor when approved by admin
      UPDATE public.profiles SET role = 'vendor', active_mode = 'vendor'
      WHERE id = NEW.user_id AND role = 'buyer';
    END IF;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_protect_vendor_verification
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.protect_vendor_verification();

-- 4. PRODUCTS TABLE (With Smart Moderation Workflow & Stale Tracking)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  stock_status TEXT NOT NULL DEFAULT 'available' CHECK (stock_status IN ('available', 'low_stock', 'out_of_stock')),
  stock_quantity INTEGER DEFAULT 1,
  images TEXT[] NOT NULL DEFAULT '{}',
  variants JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  last_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_status_stock ON public.products(status, stock_status);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX idx_products_slug ON public.products(slug);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved products; owners and admins can view all."
  ON public.products FOR SELECT USING (
    status = 'approved'
    OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = products.vendor_id AND v.user_id = auth.uid())
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Vendors can insert products for their own shop."
  ON public.products FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = products.vendor_id
      AND v.user_id = auth.uid()
      AND v.verification_status != 'suspended'
    )
    AND status = 'pending_review'
  );

CREATE POLICY "Vendors can update own products; admins can moderate."
  ON public.products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = products.vendor_id AND v.user_id = auth.uid())
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Vendors can delete own products; admins can delete any."
  ON public.products FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = products.vendor_id AND v.user_id = auth.uid())
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Smart Product Moderation Trigger:
-- 1. Routine updates (price, stock_status, stock_quantity, last_confirmed_at, variants) save immediately without re-review.
-- 2. Major changes (title, images, category_id) by a non-admin automatically return the listing to 'pending_review'.
-- 3. Non-admins cannot self-approve a product.
CREATE OR REPLACE FUNCTION public.handle_product_moderation_rules()
RETURNS TRIGGER AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin FROM public.profiles WHERE id = auth.uid();

  IF NOT COALESCE(is_admin, false) THEN
    -- Prevent vendor from self-approving
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
      NEW.status := OLD.status;
    END IF;

    -- If title, photos, or category changed on an approved product, require re-review
    IF OLD.status = 'approved' AND (
      NEW.title IS DISTINCT FROM OLD.title OR
      NEW.images IS DISTINCT FROM OLD.images OR
      NEW.category_id IS DISTINCT FROM OLD.category_id
    ) THEN
      NEW.status := 'pending_review';
    END IF;

    -- Refresh last_confirmed_at when vendor updates stock or price
    IF NEW.price IS DISTINCT FROM OLD.price OR NEW.stock_status IS DISTINCT FROM OLD.stock_status THEN
      NEW.last_confirmed_at := NOW();
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_product_moderation_rules
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_product_moderation_rules();

-- 5. REPORTS TABLE (Public & Authenticated Reporting)
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_contact TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('product', 'vendor')),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a report."
  ON public.reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view and manage reports."
  ON public.reports FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Only admins can update reports."
  ON public.reports FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 6. MODERATION LOGS TABLE
CREATE TABLE public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('product', 'vendor', 'report', 'category')),
  target_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view and insert moderation logs."
  ON public.moderation_logs FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 7. STORAGE BUCKET & POLICIES FOR PRODUCT IMAGES
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('product-images', 'product-images', true, 5242880)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;
CREATE POLICY "Users can delete own product images"
  ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.uid() = owner);

