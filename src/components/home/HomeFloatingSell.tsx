'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, X, ShoppingBag, Briefcase, Bed, Store, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackFlyerEvent } from '@/lib/analytics'

interface HomeFloatingSellProps {
  isLoggedIn: boolean
  hasStore: boolean
}

export function HomeFloatingSell({ isLoggedIn, hasStore }: HomeFloatingSellProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Close sheet on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Prevent background body scroll when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Helpers to build destination links
  const getItemHref = () => {
    if (!isLoggedIn) return '/login?next=%2Fvendor%2Fdashboard%3Ftab%3Dnew%26kind%3Ditem'
    if (!hasStore) return '/vendor/apply?next=%2Fvendor%2Fdashboard%3Ftab%3Dnew%26kind%3Ditem'
    return '/vendor/dashboard?tab=new&kind=item'
  }

  const getServiceHref = () => {
    if (!isLoggedIn) return '/login?next=%2Fvendor%2Fdashboard%3Ftab%3Dnew%26kind%3Dsvc'
    if (!hasStore) return '/vendor/apply?next=%2Fvendor%2Fdashboard%3Ftab%3Dnew%26kind%3Dsvc'
    return '/vendor/dashboard?tab=new&kind=svc'
  }

  const getRoomHref = () => {
    if (!isLoggedIn) return '/login?next=%2Fvendor%2Fdashboard%3Ftab%3Dnew%26kind%3Droom'
    if (!hasStore) return '/vendor/apply?next=%2Fvendor%2Fdashboard%3Ftab%3Dnew%26kind%3Droom'
    return '/vendor/dashboard?tab=new&kind=room'
  }

  const getStoreHref = () => {
    if (!isLoggedIn) return '/login?next=%2Fvendor%2Fdashboard'
    if (!hasStore) return '/vendor/apply'
    return '/vendor/dashboard?tab=store'
  }

  return (
    <>
      {/* Floating Sell Action Button (Home Page Mobile) */}
      <button
        type="button"
        onClick={() => {
          if (!isOpen) trackFlyerEvent('sell_flow_start')
          setIsOpen((prev) => !prev)
        }}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close listing sheet' : 'Sell or list on Jetty'}
        className={cn(
          'fixed right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+64px)] z-[80] md:hidden',
          'h-12 px-4 rounded-full font-bold text-[14px] flex items-center gap-2 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.18)] active:scale-95 cursor-pointer select-none',
          isOpen
            ? 'bg-foreground text-background shadow-xl scale-105'
            : 'bg-[#E8B84A] hover:bg-[#F0C35B] text-[#0A2626] border border-[#F5D076]/80 shadow-[0_8px_24px_rgba(232,184,74,0.45)]'
        )}
      >
        <Plus
          className={cn(
            'w-5 h-5 transition-transform duration-300 stroke-[2.4]',
            isOpen && 'rotate-45'
          )}
        />
        <span>{isOpen ? 'Close' : 'Sell'}</span>
      </button>

      {/* Dimmed Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Bottom Sheet Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-x-0 bottom-0 z-[75] bg-card rounded-t-3xl border-t border-border shadow-[0_-12px_40px_rgba(0,0,0,0.25)] pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-3 px-5 transition-transform duration-300 ease-out max-w-lg mx-auto md:hidden"
        >
          {/* Top Drag Indicator */}
          <div className="w-10 h-1.5 rounded-full bg-border/80 mx-auto mb-3.5" />

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-foreground font-sans tracking-tight">
                  What would you like to list?
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Free
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                List instantly · Reach students directly on WhatsApp
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Listing Options */}
          <div className="space-y-2.5">
            {/* 1. List an Item */}
            <Link
              href={getItemHref()}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 hover:bg-muted/40 active:scale-[0.98] transition-all group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[14px] font-bold text-foreground">List an Item</h4>
                </div>
                <p className="text-[12px] text-muted-foreground truncate">
                  Cadet kit, boots, phones, electronics, textbooks &amp; snacks
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 2. List a Service */}
            <Link
              href={getServiceHref()}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 hover:bg-muted/40 active:scale-[0.98] transition-all group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-[#0F6E6E] dark:text-[#22D3EE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[14px] font-bold text-foreground">List a Service</h4>
                </div>
                <p className="text-[12px] text-muted-foreground truncate">
                  Uniform tailoring, barbing, laundry, tutorials &amp; photos
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* 3. List a Lodge / Room */}
            <Link
              href={getRoomHref()}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 hover:bg-muted/40 active:scale-[0.98] transition-all group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Bed className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[14px] font-bold text-foreground">List a Lodge or Room</h4>
                </div>
                <p className="text-[12px] text-muted-foreground truncate">
                  Hostel rooms, self-contain, bedspaces near campus
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Divider */}
            <div className="pt-2 border-t border-border/60">
              {/* 4. Open Store as Vendor / Edit Profile */}
              <Link
                href={getStoreHref()}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/40 border border-border/60 hover:bg-muted/70 active:scale-[0.98] transition-all group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Store className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[14px] font-bold text-foreground">
                      {hasStore ? 'My Store & Profile' : 'Open a Free Store'}
                    </h4>
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate">
                    {hasStore
                      ? 'Edit shop details, profile photo, WhatsApp & bio'
                      : 'Create your verified vendor storefront on Jetty'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
