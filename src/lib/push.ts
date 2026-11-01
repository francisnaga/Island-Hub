/**
 * src/lib/push.ts
 * Server-side admin push notification utility.
 * Sends push to all registered admin subscriptions via VAPID/Web Push.
 * Never throws — push failure must never break the main request.
 */
import webPush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

function initVapid() {
  const email = process.env.VAPID_EMAIL || 'mailto:efobifrancis53@gmail.com'
  const pubKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privKey = process.env.VAPID_PRIVATE_KEY

  if (pubKey && privKey) {
    try {
      webPush.setVapidDetails(email, pubKey, privKey)
    } catch (e) {
      console.error('[Push] VAPID configuration error:', e)
    }
  }
}

initVapid()

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * Sends a push notification to every admin subscription stored in push_subscriptions.
 * Invalid/expired subscriptions (HTTP 410 / 404) are auto-cleaned up.
 */
export async function sendAdminPush(payload: PushPayload): Promise<void> {
  try {
    initVapid()
    const adminDb = await createAdminClient()
    const { data: subs, error: subsError } = await adminDb
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth_key')

    if (subsError) {
      console.error('[Push] Error loading subscriptions:', subsError)
      return
    }

    if (!subs || subs.length === 0) {
      console.log('[Push] No active admin push subscriptions registered in database.')
      return
    }

    console.log(`[Push] Dispatching "${payload.title}" to ${subs.length} admin device(s)...`)

    const message = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/admin',
      tag: payload.tag || `jetty-${Date.now()}`,
    })

    await Promise.allSettled(
      subs.map((sub) =>
        webPush
          .sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth_key },
            },
            message
          )
          .then((res) => {
            console.log(`[Push] Successfully delivered to ${sub.endpoint.slice(0, 35)}... (status: ${res.statusCode})`)
          })
          .catch(async (err: any) => {
            console.error(`[Push] Failed to deliver to ${sub.endpoint.slice(0, 35)}... status: ${err?.statusCode}, message: ${err?.message}`)
            // HTTP 410 = subscription expired/unregistered; 404 = endpoint gone
            if (err?.statusCode === 410 || err?.statusCode === 404) {
              await adminDb
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', sub.endpoint)
              console.log('[Push] Cleaned up expired subscription.')
            }
          })
      )
    )
  } catch (err: any) {
    console.error('[Push] Unexpected error in sendAdminPush:', err?.message || err)
  }
}
