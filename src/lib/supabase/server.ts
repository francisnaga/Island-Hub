import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const FALLBACK_SUPABASE_URL = 'https://zagfgxhewhwothrbyesw.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZ2ZneGhld2h3b3RocmJ5ZXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzg1NDAsImV4cCI6MjA4ODkxNDU0MH0.iBKqu5z7WMATRF0sJOm60LsJnue0XKfi91N1AdhSXz4'

export async function createClient() {
  const cookieStore = await cookies()
  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL).trim()
  const url = rawUrl.includes('jlhnzqanrzwiiyrwfbja') ? FALLBACK_SUPABASE_URL : rawUrl
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY).trim()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
        }
      },
    },
  })
}
