/**
 * POST /api/push/report-notify
 * Called by ReportListingModal after a report is submitted.
 * Sends an admin push notification — no auth required (report itself is the trigger).
 */
import { NextRequest, NextResponse } from 'next/server'
import { sendAdminPush } from '@/lib/push'

export async function POST(req: NextRequest) {
  try {
    const { targetType, reason } = await req.json()
    const emoji = targetType === 'vendor' ? '🚩' : '⚠️'
    const label = targetType === 'vendor' ? 'Vendor' : 'Listing'

    await sendAdminPush({
      title: `${emoji} ${label} Reported`,
      body: reason || `A ${label.toLowerCase()} was reported for review`,
      url: '/admin',
      tag: 'report',
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Never surface errors — this is fire-and-forget
    return NextResponse.json({ ok: true })
  }
}
