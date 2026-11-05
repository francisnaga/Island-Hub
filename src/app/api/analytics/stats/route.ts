import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const FLYER_TAGS_META: Record<string, { label: string; channel: string; target: 'buyers' | 'sellers' }> = {
  wb: { label: 'Buyers poster (loud)', channel: 'Wall poster A3', target: 'buyers' },
  wc: { label: 'Buyers poster (calm)', channel: 'Wall poster A3', target: 'buyers' },
  ws: { label: 'Sellers poster', channel: 'Wall poster A3', target: 'sellers' },
  hb: { label: 'Hand flyer front', channel: 'Hand flyer A5', target: 'buyers' },
  hs: { label: 'Hand flyer back', channel: 'Hand flyer A5', target: 'sellers' },
  wab: { label: 'WhatsApp image (buyers)', channel: 'WhatsApp image', target: 'buyers' },
  was: { label: 'WhatsApp image (sellers)', channel: 'WhatsApp image', target: 'sellers' },
}

export async function GET(request: NextRequest) {
  try {
    // ── Admin-only guard ────────────────────────────────────────────────────
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // ────────────────────────────────────────────────────────────────────────

    const adminDb = await createAdminClient()
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'all' // 'today' | '7d' | 'all'

    let query = adminDb.from('campaign_events').select('tag, event_type, date_bucket')

    const todayStr = new Date().toISOString().slice(0, 10)
    if (timeframe === 'today') {
      query = query.eq('date_bucket', todayStr)
    } else if (timeframe === '7d') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      query = query.gte('date_bucket', sevenDaysAgo)
    }

    const { data, error } = await query

    const counts: Record<string, { visits: number; sell_flow_starts: number; stores_created: number; whatsapp_taps: number }> = {}

    // Initialize all recognized tags so table shows all 7 channels even with 0 events
    for (const tag of Object.keys(FLYER_TAGS_META)) {
      counts[tag] = { visits: 0, sell_flow_starts: 0, stores_created: 0, whatsapp_taps: 0 }
    }

    if (data && !error) {
      for (const row of data as Array<{ tag: string; event_type: string }>) {
        const t = row.tag
        if (!counts[t]) {
          counts[t] = { visits: 0, sell_flow_starts: 0, stores_created: 0, whatsapp_taps: 0 }
        }
        if (row.event_type === 'visit') counts[t].visits++
        else if (row.event_type === 'sell_flow_start') counts[t].sell_flow_starts++
        else if (row.event_type === 'store_created') counts[t].stores_created++
        else if (row.event_type === 'whatsapp_tap') counts[t].whatsapp_taps++
      }
    }

    const results = Object.entries(counts).map(([tag, stats]) => {
      const meta = FLYER_TAGS_META[tag] || { label: `Custom tag (${tag})`, channel: 'Other', target: 'buyers' }
      const conversionRate = stats.visits > 0 ? ((stats.whatsapp_taps + stats.stores_created) / stats.visits) * 100 : 0
      return {
        tag,
        label: meta.label,
        channel: meta.channel,
        target: meta.target,
        ...stats,
        conversionRate: Math.round(conversionRate * 10) / 10,
      }
    })

    // Sort recognized tags first, then highest visits
    results.sort((a, b) => {
      const aKnown = Boolean(FLYER_TAGS_META[a.tag])
      const bKnown = Boolean(FLYER_TAGS_META[b.tag])
      if (aKnown && !bKnown) return -1
      if (!aKnown && bKnown) return 1
      return b.visits - a.visits
    })

    return NextResponse.json({
      timeframe,
      totalVisits: results.reduce((acc, r) => acc + r.visits, 0),
      totalSellStarts: results.reduce((acc, r) => acc + r.sell_flow_starts, 0),
      totalStoresCreated: results.reduce((acc, r) => acc + r.stores_created, 0),
      totalWhatsAppTaps: results.reduce((acc, r) => acc + r.whatsapp_taps, 0),
      tags: results,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch flyer stats' },
      { status: 500 }
    )
  }
}
