'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { JettyMark } from '@/components/brand/JettyMark'

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
      {/* Sleek top indeterminate progress bar */}
      <div className="fixed top-0 inset-x-0 z-[100] h-0.5 bg-primary/20 overflow-hidden pointer-events-none">
        <div className="h-full w-1/2 bg-primary animate-[pulse_0.8s_ease-in-out_infinite] rounded-full" />
      </div>

      {/* Subtle floating Jetty brand loader pill so user knows their tap worked immediately */}
      <div
        role="status"
        aria-live="polite"
        className="fixed top-16 left-1/2 -translate-x-1/2 z-[90] inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-3.5 py-1.5 shadow-lg backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      >
        <JettyMark
          size={20}
          className="h-5 w-5 rounded-md animate-spin"
          style={{ animationDuration: '1.1s' }}
        />
        <span className="text-xs font-semibold text-foreground tracking-tight">
          Loading…
        </span>
      </div>
    </>
  )
}
