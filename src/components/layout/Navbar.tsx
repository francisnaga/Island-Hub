'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search,
  Store,
  LogOut,
  ShieldAlert,
  LogIn,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isAdminEmail, UserProfile, Vendor } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { DarkModeToggle } from './DarkModeToggle'
import { JettyMark } from '@/components/brand/JettyMark'
import { CampusSelectorModal } from './CampusSelectorModal'

interface NavbarProps {
  user: { id: string; email?: string; full_name?: string; avatar_url?: string } | null
  profile: UserProfile | null
  vendor: Vendor | null
}

export function Navbar({ user, profile, vendor }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolledPastGreen, setIsScrolledPastGreen] = useState(false)

  const isDetailPage =
    pathname.startsWith('/product/') ||
    (pathname.startsWith('/housing/') && pathname !== '/housing')

  useEffect(() => {
    let rafId: number | null = null

    const computeThreshold = () => {
      const greenHero = document.querySelector('[data-teal-hero]')
      if (greenHero instanceof HTMLElement) {
        return Math.max(8, greenHero.offsetHeight - 58)
      }
      return 8
    }

    let threshold = computeThreshold()

    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const past = window.scrollY > threshold
        setIsScrolledPastGreen((prev) => (prev !== past ? past : prev))
      })
    }

    const onResize = () => {
      threshold = computeThreshold()
      onScroll()
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [pathname])

  // Hide main header on full-screen form flows (onboarding & listing forms have their own .ftop bar)
  if (
    pathname.startsWith('/vendor/apply') ||
    pathname.startsWith('/vendor/products/')
  ) {
    return null
  }

  const isSellingMode = pathname.startsWith('/vendor/dashboard')
  const isAdmin =
    profile?.role === 'admin' || isAdminEmail(user?.email) || isAdminEmail(profile?.email)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      router.push('/marketplace')
      return
    }
    router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/', label: 'Home', exact: true },
    { href: '/marketplace', label: 'Market' },
    { href: '/services', label: 'Services' },
    { href: '/housing', label: 'Lodge' },
    { href: '/fresher-kit', label: 'Fresher Kit' },
    { href: '/safety', label: 'Safety' },
  ]

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-[#0A4F4F] text-white pt-[env(safe-area-inset-top,0px)]',
        'before:content-[""] before:absolute before:bottom-full before:inset-x-0 before:h-[120vh] before:bg-[#0A4F4F] before:pointer-events-none',
        isScrolledPastGreen
          ? 'border-b border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
          : 'border-b border-transparent shadow-none',
        isDetailPage && 'hidden md:block'
      )}
    >
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Official Jetty Brand Lockup */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            aria-label="Jetty — NMU Campus Marketplace Home"
            className="flex items-center gap-2 py-1 pr-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-lg"
          >
            <JettyMark size={32} className="h-8 w-8 shrink-0" />
            <span className="text-2xl font-semibold tracking-[0.02em] text-white lowercase leading-none font-[family-name:var(--font-bricolage)]">
              jetty
            </span>
          </Link>
        </div>

        {/* Quick Search Bar (Desktop — Buyer Mode only) */}
        {!isSellingMode && (
          <form onSubmit={handleSearch} role="search" className="hidden md:flex flex-1 max-w-sm mx-2 min-w-0">
            <div className="relative w-full">
              <label htmlFor="navbar-search-input" className="sr-only">
                Search listings across NMU Okerenkoko and Kurutie
              </label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50 pointer-events-none" />
              <input
                id="navbar-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search boots, rigs, lodge, haircuts..."
                className="w-full h-9 pl-9 pr-4 rounded-xl border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.15] text-[13px] text-white placeholder:text-white/45 focus:bg-white/[0.10] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/25 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
              />
            </div>
          </form>
        )}

        {/* Desktop Links (Buyer Mode only) — Linear-grade Segmented Nav Bar */}
        {!isSellingMode && (
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-0.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            {navLinks.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white leading-none',
                    isActive
                      ? 'bg-white/[0.12] text-white font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Right Actions — Linear-grade Geometric Consistency (h-9 rounded-xl) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Desktop: Buying | Selling Segmented Control — Linear-grade */}
          {user && vendor && (
            <div
              role="group"
              aria-label="Mode"
              className="hidden md:inline-flex items-center h-9 p-[3px] rounded-xl bg-white/[0.05] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            >
              <Link
                href="/"
                aria-pressed={!isSellingMode}
                className={cn(
                  'h-7 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center transition-all',
                  !isSellingMode
                    ? 'bg-white/[0.16] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]'
                    : 'text-white/70 hover:text-white'
                )}
              >
                Buying
              </Link>
              <Link
                href="/vendor/dashboard"
                aria-pressed={isSellingMode}
                className={cn(
                  'h-7 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center transition-all',
                  isSellingMode
                    ? 'bg-white/[0.16] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]'
                    : 'text-white/70 hover:text-white'
                )}
              >
                Selling
              </Link>
            </div>
          )}

          {/* Mobile: Only show "Buying" switch when inside Vendor Dashboard */}
          {user && vendor && isSellingMode && (
            <Link
              href="/"
              className="md:hidden inline-flex h-8 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
            >
              <span>Buying</span>
            </Link>
          )}

          {user && isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition-colors shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
                pathname.startsWith('/admin')
                  ? 'bg-white text-[#0A4F4F]'
                  : 'border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.10] text-white'
              )}
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-300" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {/* Mobile: mode switch visible for admin in admin panel */}
          {user && isAdmin && pathname.startsWith('/admin') && (
            <div className="md:hidden inline-flex items-center p-[2px] rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <Link
                href="/"
                className="h-7 px-2.5 rounded-lg text-xs font-medium inline-flex items-center justify-center transition-colors text-white/80 hover:text-white"
              >
                Buy
              </Link>
              {vendor && (
                <Link
                  href="/vendor/dashboard"
                  className="h-7 px-2.5 rounded-lg text-xs font-medium inline-flex items-center justify-center transition-colors text-white/80 hover:text-white"
                >
                  Sell
                </Link>
              )}
            </div>
          )}

          {user && !vendor && !isSellingMode && (
            <Link
              href="/vendor/apply"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#E8B84A] hover:bg-[#F2C968] text-[#0A2626] px-3.5 text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <Store className="h-3.5 w-3.5 stroke-[2.2]" />
              <span>Start selling</span>
            </Link>
          )}

          {!user && (
            <Link
              href="/login"
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#E8B84A] hover:bg-[#F2C968] text-[#0A2626] px-3.5 text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <LogIn className="h-3.5 w-3.5 stroke-[2.2]" />
              <span>Sell</span>
            </Link>
          )}

          {/* Campus Selector directly beside DarkModeToggle in Buyer Mode */}
          {!isSellingMode && <CampusSelectorModal />}

          <DarkModeToggle />

          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.10] hover:border-white/[0.16] text-white/80 hover:text-white transition-colors cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
