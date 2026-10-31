import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

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
  const origin = getPublicOrigin(request)
  const code = searchParams.get('code')
  const stateNext = searchParams.get('state')
  const next = searchParams.get('next') || stateNext || '/'

  if (code) {
    const supabase = await createClient()
    let authenticatedUser: User | null = null

    const googleClientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '933767752231-lqadfle5brnh3bcf05q8lhfdd6ulpvsn.apps.googleusercontent.com'
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

    // 1. First-party Google OAuth exchange (eliminates *.supabase.co from Google screen)
    if (googleClientId && googleClientSecret) {
      try {
        const redirectUri = `${origin}/auth/callback`
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: googleClientId,
            client_secret: googleClientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        })

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          if (tokenData.id_token) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: tokenData.id_token,
              access_token: tokenData.access_token,
            })
            if (!error && data.user) {
              authenticatedUser = data.user
            }
          }
        }
      } catch (err) {
        console.error('First-party Google token exchange failed, trying PKCE fallback:', err)
      }
    }

    // 2. Fallback: standard Supabase PKCE code exchange
    if (!authenticatedUser) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data.user) {
        authenticatedUser = data.user
      }
    }

    if (authenticatedUser) {
      const user = authenticatedUser
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

      let hasCompleteVendor = false
      try {
        const { data: vendorRecord } = await supabase
          .from('vendors')
          .select('id, shop_name, whatsapp_number')
          .eq('user_id', user.id)
          .maybeSingle()
        if (vendorRecord && vendorRecord.shop_name && vendorRecord.whatsapp_number) {
          hasCompleteVendor = true
        }
      } catch (vendorCheckErr) {
        console.error('Error checking vendor onboarding status:', vendorCheckErr)
      }

      let redirectTarget = next
      if (admin) {
        if (next === '/admin' || next === '/' || next === '/login' || !hasCompleteVendor) {
          redirectTarget = '/admin'
        }
      } else if (!hasCompleteVendor) {
        redirectTarget = '/vendor/apply'
      } else if (next === '/' || next === '/login') {
        redirectTarget = '/vendor/dashboard'
      }

      const safeRedirect = redirectTarget.startsWith('/') ? redirectTarget : `/${redirectTarget}`
      return NextResponse.redirect(`${origin}${safeRedirect}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
