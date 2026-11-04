-- ============================================================================
-- JETTY CAMPUS FLYERS: SOURCE TRACKING & CONVERSION ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag VARCHAR(16) NOT NULL,
  event_type VARCHAR(32) NOT NULL, -- 'visit', 'sell_flow_start', 'store_created', 'whatsapp_tap'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_bucket DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_campaign_events_tag_date ON public.campaign_events (tag, date_bucket);
CREATE INDEX IF NOT EXISTS idx_campaign_events_type ON public.campaign_events (event_type);

ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_events' AND policyname = 'Anyone can insert campaign events'
  ) THEN
    CREATE POLICY "Anyone can insert campaign events"
      ON public.campaign_events FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_events' AND policyname = 'Admins can view campaign events'
  ) THEN
    CREATE POLICY "Admins can view campaign events"
      ON public.campaign_events FOR SELECT
      USING (true);
  END IF;
END $$;
