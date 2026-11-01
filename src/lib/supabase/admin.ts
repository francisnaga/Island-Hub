import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerUserClient } from './server'

const FALLBACK_SUPABASE_URL = 'https://zagfgxhewhwothrbyesw.supabase.co'
const FALLBACK_SERVICE_ROLE_KEY =
  ''

export async function createAdminClient() {
  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL).trim()
  const url = rawUrl.includes('jlhnzqanrzwiiyrwfbja') ? FALLBACK_SUPABASE_URL : rawUrl
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY).trim()

  if (serviceKey) {
    return createSupabaseClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return createServerUserClient()
}
