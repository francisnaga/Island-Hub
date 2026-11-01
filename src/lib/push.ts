/**
 * src/lib/push.ts
 * Server-side admin push notification utility.
 * Sends push to all registered admin subscriptions via VAPID/Web Push.
 * Never throws — push failure must never break the main request.
 */
import webPush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

// Configure VAPID once at module load
webPush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

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
    const adminDb = await createAdminClient()
    const { data: subs } = await adminDb
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth_key')

    if (!subs || subs.length === 0) return

    const message = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/admin',
      tag: payload.tag || 'jetty-admin',
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
          .catch(async (err: any) => {
            // HTTP 410 = subscription gone; 404 = endpoint not found — clean both up
            if (err?.statusCode === 410 || err?.statusCode === 404) {
              await adminDb
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', sub.endpoint)
            }
          })
      )
    )
  } catch {
    // Silently ignore — push is best-effort, must never break an API route
  }
}
