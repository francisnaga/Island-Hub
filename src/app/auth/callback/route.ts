import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user
      const admin = isAdminEmail(user.email)

      try {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'Jetty Seller',
            email: user.email,
            avatar_url:
              user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            ...(admin ? { role: 'admin' } : {}),
          },
          { onConflict: 'id' }
        )
      } catch (profileErr) {
        console.error('Error auto-syncing profile during auth callback:', profileErr)
      }

      const redirectTarget =
        admin && (next === '/' || next === '/vendor/dashboard')
          ? '/admin'
          : next

      return NextResponse.redirect(`${origin}${redirectTarget}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
