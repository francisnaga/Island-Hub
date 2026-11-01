/**
 * ONE-TIME MIGRATION ROUTE — DELETE AFTER USE
 * Creates push_subscriptions table if it doesn't exist.
 * Protected by a secret token so only we can call it.
 * GET /api/migrate/push-table?secret=jetty_migrate_2024
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Pool } from 'pg'

const MIGRATION_SECRET = 'jetty_migrate_2024'

const SQL = `
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DO $mig$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'push_subscriptions'
    AND policyname = 'Users manage own subscriptions'
  ) THEN
    CREATE POLICY "Users manage own subscriptions" ON push_subscriptions
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $mig$;
`

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // First check if table already exists via Supabase client
  const supabase = await createAdminClient()
  const { error: checkError } = await supabase
    .from('push_subscriptions')
    .select('id')
    .limit(1)

  if (!checkError) {
    return NextResponse.json({ status: 'already_exists', message: 'push_subscriptions table already exists ✅' })
  }

  if (checkError.code !== 'PGRST205' && checkError.code !== '42P01') {
    return NextResponse.json({ error: checkError.message, code: checkError.code }, { status: 500 })
  }

  // Table doesn't exist — create it via direct pg connection
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    return NextResponse.json({
      error: 'DATABASE_URL env var not set. Add the Supabase connection string to Vercel env vars.',
      hint: 'Get it from: Supabase Dashboard → Project Settings → Database → Connection string (URI mode, Session pooler port 5432)',
    }, { status: 500 })
  }

  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 })
  try {
    const client = await pool.connect()
    await client.query(SQL)
    client.release()
    await pool.end()
    return NextResponse.json({ status: 'created', message: '✅ push_subscriptions table created successfully!' })
  } catch (err: unknown) {
    await pool.end().catch(() => {})
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
