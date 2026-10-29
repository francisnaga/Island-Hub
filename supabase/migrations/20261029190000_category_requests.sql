CREATE TABLE IF NOT EXISTS public.category_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  vendor_name TEXT,
  vendor_whatsapp TEXT,
  name TEXT NOT NULL,
  description TEXT,
  suggested_icon TEXT DEFAULT 'Package',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.category_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'category_requests' AND policyname = 'Anyone can view category requests'
  ) THEN
    CREATE POLICY "Anyone can view category requests"
      ON public.category_requests FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'category_requests' AND policyname = 'Anyone can insert category requests'
  ) THEN
    CREATE POLICY "Anyone can insert category requests"
      ON public.category_requests FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'category_requests' AND policyname = 'Admins can update category requests'
  ) THEN
    CREATE POLICY "Admins can update category requests"
      ON public.category_requests FOR UPDATE
      USING (public.is_jetty_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'category_requests' AND policyname = 'Admins can delete category requests'
  ) THEN
    CREATE POLICY "Admins can delete category requests"
      ON public.category_requests FOR DELETE
      USING (public.is_jetty_admin());
  END IF;
END $$;
