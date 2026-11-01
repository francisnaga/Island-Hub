import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import { sendAdminPush } from '@/lib/push'

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

    // 1. Primary: standard Supabase PKCE code exchange
    const { data: pkceData, error: pkceError } = await supabase.auth.exchangeCodeForSession(code)
    if (!pkceError && pkceData.user) {
      authenticatedUser = pkceData.user
    }

    // 2. Fallback: First-party Google OAuth exchange
    if (!authenticatedUser && googleClientId && googleClientSecret) {
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
        console.error('First-party Google token exchange failed:', err)
      }
    }

    if (authenticatedUser) {
      const user = authenticatedUser
      const admin = isAdminEmail(user.email)

      try {
        const adminDb = await createAdminClient()
        const { data: existingProfile } = await adminDb
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()
        const isNewUser = !existingProfile

        await adminDb.from('profiles').upsert(
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

        // Notify admin of new sign-up (only for brand-new non-admin accounts)
        if (isNewUser && !admin) {
          const displayName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Someone'
          await sendAdminPush({
            title: '👤 New Sign-Up',
            body: `${displayName} (${user.email || 'Google User'}) just joined Jetty`,
            url: '/admin',
            tag: `signup-${user.id}`,
          })
        }
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
        // Admin always goes to /admin unless they explicitly requested somewhere else
        if (next === '/admin' || next === '/' || next === '/login') {
          redirectTarget = '/admin'
        }
      } else if (!hasCompleteVendor) {
        // Only force onboarding if user came FROM vendor apply / login-to-sell flow
        const wantsToSell =
          next === '/vendor/apply' ||
          next === '/vendor/dashboard' ||
          next === '/login?next=/vendor/apply'
        if (wantsToSell) {
          redirectTarget = '/vendor/apply'
        } else if (next === '/' || next === '/login') {
          // Buyer with no vendor — send to marketplace, not onboarding
          redirectTarget = '/marketplace'
        }
        // else: respect whatever `next` they had
      } else {
        // Has complete vendor profile
        if (next === '/' || next === '/login') {
          redirectTarget = '/vendor/dashboard'
        }
      }

      const safeRedirect = redirectTarget.startsWith('/') ? redirectTarget : `/${redirectTarget}`
      return NextResponse.redirect(`${origin}${safeRedirect}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
