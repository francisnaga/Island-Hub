'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function NavigationFeedback() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  // Clear loading state as soon as route/search params commit
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname, searchParams])

  // Safety timeout so loader never gets stuck if navigation is a no-op
  useEffect(() => {
    if (!isNavigating) return
    const timer = setTimeout(() => setIsNavigating(false), 4000)
    return () => clearTimeout(timer)
  }, [isNavigating])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      const anchor = (e.target as HTMLElement | null)?.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      const target = anchor.getAttribute('target')
      if (!href || target === '_blank' || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) {
        return
      }

      // Check if navigating to a different URL than current
      const currentFull = window.location.pathname + window.location.search
      if (href !== currentFull && href !== window.location.pathname) {
        setIsNavigating(true)
      }
    }

    const handleSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement | null
      if (form && form.getAttribute('action')?.startsWith('/')) {
        setIsNavigating(true)
      }
    }

    document.addEventListener('click', handleClick, true)
    document.addEventListener('submit', handleSubmit, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('submit', handleSubmit, true)
    }
  }, [])

  if (!isNavigating) return null

  return (
    <>
      {/* Sleek top indeterminate progress bar (Linear / GitHub style) */}
      <div className="fixed top-0 inset-x-0 z-[100] h-[2.5px] bg-transparent overflow-hidden pointer-events-none">
        <div className="h-full w-2/5 bg-foreground animate-[shimmer_1.2s_infinite] rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      </div>

      {/* Subtle floating navigation pill — clean pulsing dot, zero spinning logo */}
      <div
        role="status"
        aria-live="polite"
        className="fixed top-16 left-1/2 -translate-x-1/2 z-[90] inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-1.5 shadow-md backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
        </span>
        <span className="text-xs font-medium text-foreground tracking-tight">
          Loading…
        </span>
      </div>
    </>
  )
}
