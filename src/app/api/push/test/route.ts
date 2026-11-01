import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/types'
import { sendAdminPush } from '@/lib/push'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    await sendAdminPush({
      title: '🔔 Jetty Admin Alert',
      body: 'Push notifications are working perfectly on this device! You will receive alerts when new listings or reports arrive.',
      url: '/admin',
      tag: 'test-alert',
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to send test push' }, { status: 500 })
  }
}
