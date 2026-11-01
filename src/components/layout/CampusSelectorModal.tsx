'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronDown, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CampusSelection = 'all' | 'okerenkoko' | 'kurutie'

export function CampusSelectorModal({ className = '' }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [currentCampus, setCurrentCampus] = useState<CampusSelection>('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // 1. Read from URL if present
    const urlCampus = searchParams.get('campus')?.toLowerCase()
    if (urlCampus === 'okerenkoko' || urlCampus === 'kurutie') {
      setCurrentCampus(urlCampus)
      return
    }

    // 2. Read from document.cookie
    const match = document.cookie.match(/(?:^|; )jetty_campus=([^;]*)/)
    if (match && (match[1] === 'okerenkoko' || match[1] === 'kurutie')) {
      setCurrentCampus(match[1] as CampusSelection)
      return
    }

    // 3. Read from localStorage
    const stored = localStorage.getItem('jetty_campus')?.toLowerCase()
    if (stored === 'okerenkoko' || stored === 'kurutie') {
      setCurrentCampus(stored as CampusSelection)
    } else {
      setCurrentCampus('all')
    }
  }, [searchParams])

  const setCampus = (c: CampusSelection) => {
    setCurrentCampus(c)
    // Persist in cookie (1 year)
    document.cookie = `jetty_campus=${c}; path=/; max-age=31536000; SameSite=Lax`
    // Persist in localStorage
    localStorage.setItem('jetty_campus', c)

    setIsOpen(false)

    // Sync with router if on marketplace, housing, or home
    const sp = new URLSearchParams(searchParams.toString())
    if (c === 'all') {
      sp.delete('campus')
    } else {
      sp.set('campus', c)
    }
    const qStr = sp.toString()
    router.push(`${pathname}${qStr ? `?${qStr}` : ''}`)
    router.refresh()
  }

  const campusLabel =
    currentCampus === 'okerenkoko'
      ? 'Okerenkoko'
      : currentCampus === 'kurutie'
      ? 'Kurutie'
      : 'Both campuses'

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Sheet Container */}
      <div className="relative w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 z-10 pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground font-[family-name:var(--font-bricolage)]">
              Which campus?
            </h3>
            <p className="text-xs text-muted-foreground">
              Filter listings and merchants near you
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close dialog"
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 pt-1" role="radiogroup">
          {/* Option 1: Both campuses */}
          <button
            type="button"
            onClick={() => setCampus('all')}
            role="radio"
            aria-checked={currentCampus === 'all'}
            className={cn(
              'w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer',
              currentCampus === 'all'
                ? 'border-foreground bg-muted/70 shadow-2xs'
                : 'border-border/80 hover:border-foreground/30 hover:bg-muted/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted border border-border/60 flex items-center justify-center shrink-0">
                <span className="dot b" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Both campuses</h4>
                <p className="text-xs text-muted-foreground">Okerenkoko &amp; Kurutie</p>
              </div>
            </div>
            {currentCampus === 'all' && (
              <Check className="h-4 w-4 text-foreground shrink-0" />
            )}
          </button>

          {/* Option 2: Okerenkoko */}
          <button
            type="button"
            onClick={() => setCampus('okerenkoko')}
            role="radio"
            aria-checked={currentCampus === 'okerenkoko'}
            className={cn(
              'w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer',
              currentCampus === 'okerenkoko'
                ? 'border-foreground bg-muted/70 shadow-2xs'
                : 'border-border/80 hover:border-foreground/30 hover:bg-muted/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted border border-border/60 flex items-center justify-center shrink-0">
                <span className="dot" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Okerenkoko</h4>
                <p className="text-xs text-muted-foreground">Permanent site</p>
              </div>
            </div>
            {currentCampus === 'okerenkoko' && (
              <Check className="h-4 w-4 text-foreground shrink-0" />
            )}
          </button>

          {/* Option 3: Kurutie */}
          <button
            type="button"
            onClick={() => setCampus('kurutie')}
            role="radio"
            aria-checked={currentCampus === 'kurutie'}
            className={cn(
              'w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer',
              currentCampus === 'kurutie'
                ? 'border-foreground bg-muted/70 shadow-2xs'
                : 'border-border/80 hover:border-foreground/30 hover:bg-muted/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted border border-border/60 flex items-center justify-center shrink-0">
                <span className="dot" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Kurutie</h4>
                <p className="text-xs text-muted-foreground">Take-off campus</p>
              </div>
            </div>
            {currentCampus === 'kurutie' && (
              <Check className="h-4 w-4 text-foreground shrink-0" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="w-full h-11 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer mt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      {/* Top Navbar Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Change campus"
        className={cn(
          'relative inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all cursor-pointer shadow-2xs shrink-0',
          className
        )}
      >
        {currentCampus === 'all' ? (
          <span className="dot b" />
        ) : (
          <span className="dot" />
        )}
        <span className="font-semibold text-white">{campusLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 text-white/70 ml-0.5" />
      </button>

      {/* Render via Portal so it escapes sticky/backdrop-blur container clipping */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  )
}
