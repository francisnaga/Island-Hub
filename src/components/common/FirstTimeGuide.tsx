'use client'

import { useState, useEffect } from 'react'
import { ShieldCheck, X } from 'lucide-react'

export function FirstTimeGuide() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('jetty_seen_guide')
    if (!seen) {
      // Delay slightly for smooth entrance
      const t = setTimeout(() => setShow(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('jetty_seen_guide', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="rounded-2xl border border-border/90 bg-card/95 backdrop-blur-md p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">👋</span>
            <h4 className="text-sm font-bold text-foreground">Welcome to Jetty</h4>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close guide"
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          The sovereign marketplace for Nigeria Maritime University. Browse cadet uniforms, student lodges, and campus trades freely. Contact vendors directly on WhatsApp.
        </p>

        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
            Verified sellers only
          </span>
          <button
            type="button"
            onClick={dismiss}
            className="px-3.5 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
