-- Migration: extend push_subscriptions to support vendor subscriptions
-- vendor_id = NULL  → admin subscription (existing behaviour, unchanged)
-- vendor_id = uuid  → vendor subscription

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE;

-- Fast lookup by vendor
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_vendor_id
  ON push_subscriptions (vendor_id)
  WHERE vendor_id IS NOT NULL;

-- Enable RLS (idempotent)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
DROP POLICY IF EXISTS "Users manage own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role (admin server) can read all subscriptions for push delivery
DROP POLICY IF EXISTS "Service role reads all push subscriptions" ON push_subscriptions;
CREATE POLICY "Service role reads all push subscriptions"
  ON push_subscriptions
  FOR SELECT
  TO service_role
  USING (true);
