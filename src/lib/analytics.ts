'use client'

export const SELLER_FLYER_TAGS = new Set(['ws', 'hs', 'was'])

export function getCleanSourceTag(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('jetty_source_tag')
  } catch {
    return null
  }
}

export function trackFlyerEvent(event: 'visit' | 'sell_flow_start' | 'store_created' | 'whatsapp_tap', explicitTag?: string) {
  if (typeof window === 'undefined') return
  try {
    const tag = explicitTag || getCleanSourceTag()
    if (!tag) return

    const payload = JSON.stringify({ tag, event })

    // Prefer navigator.sendBeacon for reliable delivery during link clicks/unloads
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/track', blob)
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    // Analytics should never break user interactions
  }
}
