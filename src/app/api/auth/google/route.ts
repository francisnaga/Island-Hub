import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getPublicOrigin(request: Request): string {
  const url = new URL(request.url)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }
  return url.origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') || '/vendor/apply'
  const origin = getPublicOrigin(request)

  const supabase = await createClient()
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  })

  if (!error && data?.url) {
    return NextResponse.redirect(data.url)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
