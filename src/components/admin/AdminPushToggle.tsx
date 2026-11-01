'use client'

/**
 * AdminPushToggle
 * Shows in the admin panel. Lets the admin enable/disable push notifications
 * for their device (registers service worker + VAPID subscription).
 *
 * Works in:
 * - Desktop Chrome, Edge, Firefox, Safari
 * - Android Chrome, Firefox
 * - Safari PWA on iPhone (iOS 16.4+ "Add to Home Screen")
 */
import { useEffect, useState } from 'react'
import { Bell, BellOff, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BInJJVgy2_t9P8oPVTWLELEaBFN1JgFyEPRiMWlR92UQ4GyCNACOGqAlI22vHtoU00deWlpB_2SMJqghN4z8EV8'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export function AdminPushToggle() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let mounted = true

    async function checkStatus() {
      // Guard against environments where ServiceWorker / PushManager are missing
      if (
        typeof window === 'undefined' ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window)
      ) {
        if (mounted) {
          setSupported(false)
          setChecking(false)
        }
        return
      }

      if (mounted) {
        setSupported(true)
      }

      try {
        // IMPORTANT: We use getRegistration() instead of navigator.serviceWorker.ready
        // because navigator.serviceWorker.ready hangs forever if no SW is registered yet!
        const checkPromise = (async () => {
          const reg = await navigator.serviceWorker.getRegistration('/')
          if (reg && reg.pushManager) {
            const existing = await reg.pushManager.getSubscription()
            return !!existing
          }
          return false
        })()

        // 2-second timeout so "checking" never hangs indefinitely
        const timeoutPromise = new Promise<boolean>((resolve) =>
          setTimeout(() => resolve(false), 2000)
        )

        const isSubscribed = await Promise.race([checkPromise, timeoutPromise])
        if (mounted) {
          setSubscribed(isSubscribed)
        }
      } catch (err) {
        console.warn('Could not check push subscription:', err)
        if (mounted) {
          setSubscribed(false)
        }
      } finally {
        if (mounted) {
          setChecking(false)
        }
      }
    }

    checkStatus()

    return () => {
      mounted = false
    }
  }, [])

  const handleEnable = async () => {
    setLoading(true)
    try {
      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID public key is not configured.')
      }

      if (typeof Notification === 'undefined') {
        throw new Error('Push notifications are not supported on this browser.')
      }

      // 1. Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Permission denied. Please allow notifications in your browser/device settings.')
        setLoading(false)
        return
      }

      // 2. Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })

      // Wait briefly for activation with safe race
      if (!reg.active) {
        await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ])
      }

      // 3. Subscribe to push
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      })

      // 4. Save to server
      const subJson = subscription.toJSON()
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save subscription to database.')
      }

      setSubscribed(true)
      toast.success('🔔 Push notifications enabled! You will receive instant alerts on this device.')
    } catch (err: any) {
      console.error('Push notification error:', err)
      toast.error(err?.message || 'Could not enable push notifications.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.getRegistration('/')
      if (reg && reg.pushManager) {
        const subscription = await reg.pushManager.getSubscription()
        if (subscription) {
          const endpoint = subscription.endpoint
          await subscription.unsubscribe()
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint }),
          })
        }
      }
      setSubscribed(false)
      toast.success('Push notifications disabled for this device.')
    } catch (err: any) {
      toast.error(err?.message || 'Could not disable push notifications.')
    } finally {
      setLoading(false)
    }
  }

  const handleTestNotification = async () => {
    setTesting(true)
    try {
      const res = await fetch('/api/push/test', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send test push')
      }
      toast.success('Test notification sent! Check your device lock screen / notification shade.')
    } catch (err: any) {
      toast.error(err?.message || 'Could not send test notification')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Admin Push Alerts</p>
            <p className="text-xs text-muted-foreground">
              {checking
                ? 'Detecting browser push capabilities…'
                : subscribed
                ? 'Active on this device — you will receive instant alerts'
                : 'Get notified for new store registrations, listings & reports'}
            </p>
          </div>
        </div>

        {!checking && !supported && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
            Note: On iPhones (iOS), Apple requires adding Jetty to your Home Screen first (tap Share → &quot;Add to Home Screen&quot;) to receive Web Push notifications.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {checking ? (
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground px-3 py-1.5">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Checking…</span>
          </div>
        ) : subscribed ? (
          <>
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={testing || loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60 transition-colors cursor-pointer"
              title="Send a sample notification to this device"
            >
              {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-primary" />}
              <span>Test alert</span>
            </button>

            <button
              type="button"
              onClick={handleDisable}
              disabled={loading || testing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellOff className="h-3.5 w-3.5" />}
              <span>Turn off</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading || !supported}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
            <span>Enable alerts</span>
          </button>
        )}
      </div>
    </div>
  )
}
