/**
 * POST /api/push/report-notify
 * Called by ReportListingModal after a report is submitted.
 * Rate-limited to prevent notification flood / spam.
 */
import { NextRequest, NextResponse } from 'next/server'
import { sendAdminPush } from '@/lib/push'

// Rate limiter: Max 5 report alerts per IP per 5 minutes
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>()
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const MAX_REPORTS_PER_WINDOW = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (entry.count >= MAX_REPORTS_PER_WINDOW) {
    return true
  }

  entry.count += 1
  return false
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    if (isRateLimited(ip)) {
      // Return ok silently to avoid alerting the spammer
      return NextResponse.json({ ok: true })
    }

    const body = await req.json().catch(() => ({}))
    const targetType = body.targetType === 'vendor' ? 'vendor' : 'listing'
    const rawReason = String(body.reason || '').trim()
    const cleanReason = rawReason.slice(0, 120) // Truncate to prevent payload abuse

    const emoji = targetType === 'vendor' ? '🚩' : '⚠️'
    const label = targetType === 'vendor' ? 'Vendor' : 'Listing'

    await sendAdminPush({
      title: `${emoji} ${label} Reported`,
      body: cleanReason || `A ${label.toLowerCase()} was reported for review`,
      url: '/admin',
      tag: `report-${Date.now()}`,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Never surface errors — this is fire-and-forget
    return NextResponse.json({ ok: true })
  }
}
