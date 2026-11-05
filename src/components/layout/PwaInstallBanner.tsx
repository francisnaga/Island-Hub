'use client'

import { useEffect, useState } from 'react'
import { X, Download, Share } from 'lucide-react'

type Platform = 'android' | 'ios' | null

/** Detect mobile platform and whether the app is already installed as PWA */
function detectPlatform(): Platform {
  if (typeof window === 'undefined') return null
  const ua = navigator.userAgent

  // Already running as a standalone PWA — don't show banner
  const isStandalone =
    ('standalone' in navigator && (navigator as any).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  if (isStandalone) return null

  // iPhone/iPad in Safari (not Chrome or Firefox on iOS)
  if (/iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)) {
    return 'ios'
  }

  // Android
  if (/Android/.test(ua)) return 'android'

  return null
}

const DISMISS_KEY = 'jetty_pwa_banner_dismissed'
const DISMISS_DAYS = 7

export function PwaInstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if the user dismissed recently
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (dismissed) {
        const daysAgo = (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24)
        if (daysAgo < DISMISS_DAYS) return
      }
    } catch {}

    const p = detectPlatform()
    if (!p) return
    setPlatform(p)

    if (p === 'android') {
      // Chrome fires beforeinstallprompt when the app is installable
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setVisible(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    } else if (p === 'ios') {
      // Show iOS instructions after a short delay so the page has settled
      const t = setTimeout(() => setVisible(true), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {}
  }

  const installAndroid = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
    if (outcome === 'accepted') {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()))
      } catch {}
    }
  }

  if (!visible || !platform) return null

  return (
    <div className="fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 px-3 pb-2 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-[480px] rounded-2xl border border-border bg-card shadow-xl px-4 py-3 flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-300">
        {/* App icon */}
        <div className="shrink-0 w-11 h-11 rounded-xl bg-[#0F6E6E] flex items-center justify-center text-white font-bold text-xl select-none">
          J
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug">
            {platform === 'android' ? 'Install Jetty app' : 'Add Jetty to your Home Screen'}
          </p>
          {platform === 'android' ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              Works offline · Faster access · No app store needed
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              In Safari tap{' '}
              <Share className="inline h-3.5 w-3.5 align-[-2px] text-foreground" />{' '}
              then{' '}
              <span className="font-medium text-foreground">Add to Home Screen</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {platform === 'android' && (
            <button
              onClick={installAndroid}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F6E6E] px-3 py-2 text-xs font-semibold text-white active:opacity-80"
            >
              <Download className="h-3.5 w-3.5" />
              Install
            </button>
          )}
          <button
            onClick={dismiss}
            aria-label="Dismiss install banner"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
