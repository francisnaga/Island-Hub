import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const RESERVED = new Set([
  'admin', 'api', 'marketplace', 'vendors', 'vendor', 'safety', 'housing',
  'services', 'login', 'profile', 'settings', 'help', 'support', 'about',
  'contact', 'health', 'migrate', 'push',
])

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('username') ?? ''
  // Strip leading '@' if provided
  const username = raw.startsWith('@') ? raw.slice(1) : raw

  if (!username) {
    return NextResponse.json({ available: false, message: 'Username is required.' }, { status: 400 })
  }

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({
      available: false,
      message: 'Username must be 3–20 characters using only a–z, 0–9, or _',
    })
  }

  if (RESERVED.has(username.toLowerCase())) {
    return NextResponse.json({ available: false, message: 'This username is reserved.' })
  }

  try {
    const adminDb = await createAdminClient()
    const { data } = await adminDb
      .from('vendors')
      .select('id')
      .ilike('username', username)
      .maybeSingle()

    if (data) {
      return NextResponse.json({ available: false, message: '@' + username + ' is already taken.' })
    }

    return NextResponse.json({ available: true, message: '@' + username + ' is available!' })
  } catch (err: any) {
    return NextResponse.json(
      { available: false, message: err?.message || 'Could not check username.' },
      { status: 500 }
    )
  }
}
