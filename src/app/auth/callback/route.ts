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
        // Super Admin (efobifrancis53@gmail.com) goes directly to /admin unless they explicitly requested a vendor route with a completed store
        if (next === '/admin' || next === '/' || next === '/login' || !hasCompleteVendor) {
          redirectTarget = '/admin'
        }
      } else if (!hasCompleteVendor) {
        // Force regular vendors through store onboarding to setup WhatsApp, campus, and shop name
        redirectTarget = '/vendor/apply'
      } else if (next === '/' || next === '/login') {
        redirectTarget = '/vendor/dashboard'
      }

      return NextResponse.redirect(`${origin}${redirectTarget}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
