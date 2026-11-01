'use client'

/**
 * AdminPushToggle
 * Shows in the admin panel. Lets the admin enable/disable push notifications
 * for their device (registers service worker + VAPID subscription).
 *
 * Works in Safari PWA on iPhone 16.4+.
 * Does NOT work in Chrome/Firefox on iOS (Apple restriction).
 */
import { useEffect, useState } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

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
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setChecking(false)
        return
      }
      setSupported(true)

      try {
        const reg = await navigator.serviceWorker.ready
        const existing = await reg.pushManager.getSubscription()
        setSubscribed(!!existing)
      } catch {
        // Ignore — will show as unsubscribed
      } finally {
        setChecking(false)
      }
    }
    checkStatus()
  }, [])

  const handleEnable = async () => {
    setLoading(true)
    try {
      // 1. Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Permission denied. Please allow notifications in your browser/device settings.')
        setLoading(false)
        return
      }

      // 2. Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      await navigator.serviceWorker.ready

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
        throw new Error(err.error || 'Failed to save subscription')
      }

      setSubscribed(true)
      toast.success('🔔 Push notifications enabled! You\'ll get alerts on this device.')
    } catch (err: any) {
      toast.error(err?.message || 'Could not enable push notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
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
      setSubscribed(false)
      toast.success('Push notifications disabled for this device.')
    } catch (err: any) {
      toast.error(err?.message || 'Could not disable push notifications')
    } finally {
      setLoading(false)
    }
  }

  // Hide if push not supported (Chrome on iOS, desktop non-HTTPS, etc.)
  if (!supported && !checking) return null

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">Admin push notifications</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {checking
            ? 'Checking status…'
            : subscribed
            ? 'Enabled on this device — you\'ll get instant alerts'
            : 'Get notified for new vendors, listings, reports & sign-ups'}
        </p>
        {!checking && !supported && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Requires Safari PWA on iPhone (iOS 16.4+) or a desktop browser
          </p>
        )}
      </div>

      {checking ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground shrink-0" />
      ) : subscribed ? (
        <button
          type="button"
          onClick={handleDisable}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400 disabled:opacity-60 transition-colors shrink-0"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellOff className="h-3.5 w-3.5" />}
          Turn off
        </button>
      ) : (
        <button
          type="button"
          onClick={handleEnable}
          disabled={loading || !supported}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity shrink-0"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
          Enable
        </button>
      )}
    </div>
  )
}
