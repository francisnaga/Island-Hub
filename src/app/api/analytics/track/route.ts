import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_EVENTS = new Set(['visit', 'sell_flow_start', 'store_created', 'whatsapp_tap'])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const rawTag = String(body.tag || '').trim().toLowerCase()
    const cleanTag = rawTag.replace(/[^a-z0-9]/g, '').slice(0, 12)
    const eventType = String(body.event || '').trim().toLowerCase()

    if (!cleanTag) {
      return NextResponse.json({ error: 'Missing or invalid tag' }, { status: 400 })
    }

    if (!VALID_EVENTS.has(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    const adminDb = await createAdminClient()
    const { error } = await adminDb.from('campaign_events').insert({
      tag: cleanTag,
      event_type: eventType,
      date_bucket: new Date().toISOString().slice(0, 10),
    })

    if (error) {
      // Table may not yet be migrated in Supabase SQL editor; log gracefully
      console.warn('campaign_events insert notice:', error.message)
    }

    return NextResponse.json({ success: true, tag: cleanTag, event: eventType })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Analytics track failed' },
      { status: 500 }
    )
  }
}
