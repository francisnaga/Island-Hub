/**
 * POST   /api/push/subscribe  — save a push subscription (admin or vendor)
 * DELETE /api/push/subscribe  — remove a push subscription
 *
 * Admin subscriptions: vendor_id = null (admin-only devices)
 * Vendor subscriptions: vendor_id = vendor's UUID (must own the vendor record)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }

    const body = await req.json()
    const { endpoint, keys, vendor_id } = body as {
      endpoint: string
      keys: { p256dh: string; auth: string }
      vendor_id?: string
    }

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    const isAdmin = isAdminEmail(user.email)
    const adminDb = await createAdminClient()

    // Non-admin users must supply a vendor_id they actually own
    if (!isAdmin) {
      if (!vendor_id) {
        return NextResponse.json({ error: 'vendor_id required for non-admin subscriptions' }, { status: 400 })
      }
      const { data: vendorRow } = await adminDb
        .from('vendors')
        .select('id')
        .eq('id', vendor_id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!vendorRow) {
        return NextResponse.json({ error: 'Vendor not found or access denied' }, { status: 403 })
      }
    }

    const { error } = await adminDb.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth_key: keys.auth,
        // Admin subscriptions keep vendor_id as null so sendAdminPush still fetches them
        vendor_id: isAdmin ? null : vendor_id ?? null,
      },
      { onConflict: 'user_id,endpoint' }
    )

    if (error) {
      console.error('[Push Subscribe] DB error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save subscription' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { endpoint } = await req.json()
    const adminDb = await createAdminClient()
    await adminDb
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to remove subscription' }, { status: 500 })
  }
}
