/**
 * ONE-TIME MIGRATION ROUTE — DELETE AFTER USE
 * Creates push_subscriptions table if it doesn't exist.
 * Protected by a secret token so only we can call it.
 * GET /api/migrate/push-table?secret=jetty_migrate_2024
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MIGRATION_SECRET = 'jetty_migrate_2024'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Step 1: Create the table
  const createResult = await supabase.rpc('create_push_subscriptions_table')

  // If RPC doesn't exist, use a raw SQL workaround via pg_catalog check
  // The admin client can use .from() to check existence
  const { error: checkError } = await supabase
    .from('push_subscriptions')
    .select('id')
    .limit(1)

  if (!checkError) {
    return NextResponse.json({
      status: 'already_exists',
      message: 'push_subscriptions table already exists ✅',
    })
  }

  if (checkError.code === 'PGRST205' || checkError.code === '42P01') {
    // Table doesn't exist — we need to create it.
    // Use the Supabase admin client's ability to call postgres functions
    // by creating a temporary function and calling it.
    
    // Actually Supabase JS doesn't support raw SQL without an RPC.
    // Let's use the service role to call the REST management API.
    const PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!PROJECT_REF || !SERVICE_KEY) {
      return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
    }

    const sql = `
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
      DO $do$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'Users manage own subscriptions'
        ) THEN
          CREATE POLICY "Users manage own subscriptions" ON push_subscriptions
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        END IF;
      END $do$;
    `

    // Supabase provides a /pg/query endpoint for service-role access
    const pgRes = await fetch(`https://${PROJECT_REF}.supabase.co/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      body: JSON.stringify({ query: sql }),
    })

    if (pgRes.ok) {
      return NextResponse.json({ status: 'created', message: 'Table created successfully ✅' })
    }

    const pgText = await pgRes.text()
    return NextResponse.json({
      status: 'pg_endpoint_failed',
      statusCode: pgRes.status,
      response: pgText,
      message: 'Could not auto-create. See response for details.',
    })
  }

  return NextResponse.json({ error: checkError.message, code: checkError.code }, { status: 500 })
}
