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

  useEffect(() => {
    const checkScroll = () => {
      // Find any green header/hero element on the page (WaterlineHero or vendor profile banner)
      const greenHero = document.querySelector('[data-teal-hero]')
      if (greenHero) {
        const rect = greenHero.getBoundingClientRect()
        // When bottom of green hero passes under the navbar (approx 56px-64px), we've scrolled past the green region
        setIsScrolledPastGreen(rect.bottom <= 58)
      } else {
        // On pages without a green hero, show subtle border when scrolled
        setIsScrolledPastGreen(window.scrollY > 8)
      }
    }

    checkScroll()
    window.addEventListener('scroll', checkScroll, { passive: true })
    return () => window.removeEventListener('scroll', checkScroll)
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
    { href: '/housing', label: 'Lodge' },
    { href: '/services', label: 'Services' },
    { href: '/fresher-kit', label: 'Fresher Kit' },
    { href: '/safety', label: 'Safety' },
  ]

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-[#0A4F4F] text-white transition-[border-color,box-shadow] duration-200',
        isScrolledPastGreen
          ? 'border-b border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
          : 'border-b border-transparent shadow-none'
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
              <input
                id="navbar-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search safety boots, action rigs, haircuts..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/20 bg-white/10 text-sm text-white placeholder:text-white/60 focus:bg-white focus:text-[#0E1B1B] focus:placeholder:text-[#5B6B6B] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
          </form>
        )}

        {/* Desktop Links (Buyer Mode only) */}
        {!isSellingMode && (
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-0.5">
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
                    'px-2.5 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                    isActive
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Desktop: Buying | Selling Segmented Pill */}
          {user && vendor && (
            <div
              role="group"
              aria-label="Mode"
              className="hidden md:inline-flex items-center p-[3px] rounded-full bg-white/10 border border-white/20"
            >
              <Link
                href="/"
                aria-pressed={!isSellingMode}
                className={cn(
                  'h-8 px-3 rounded-full text-xs font-medium inline-flex items-center justify-center transition-colors',
                  !isSellingMode
                    ? 'bg-white text-[#0A4F4F] shadow-xs font-semibold'
                    : 'text-white/80 hover:text-white'
                )}
              >
                Buying
              </Link>
              <Link
                href="/vendor/dashboard"
                aria-pressed={isSellingMode}
                className={cn(
                  'h-8 px-3 rounded-full text-xs font-medium inline-flex items-center justify-center transition-colors',
                  isSellingMode
                    ? 'bg-white text-[#0A4F4F] shadow-xs font-semibold'
                    : 'text-white/80 hover:text-white'
                )}
              >
                Selling
              </Link>
            </div>
          )}

          {/* Mobile: Only show "Buying" switch when inside Vendor Dashboard; in Buyer Mode keep top nav clean and un-compacted */}
          {user && vendor && isSellingMode && (
            <Link
              href="/"
              className="md:hidden inline-flex h-8 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
            >
              <span>Buying</span>
            </Link>
          )}

          {user && isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'inline-flex h-8 md:h-9 items-center gap-1.5 rounded-full md:rounded-lg px-2.5 text-xs font-semibold transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-white text-[#0A4F4F]'
                  : 'border border-white/25 bg-white/10 text-white hover:bg-white/20'
              )}
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-300" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {/* Mobile: mode switch visible for admin in admin panel */}
          {user && isAdmin && pathname.startsWith('/admin') && (
            <div className="md:hidden inline-flex items-center p-[3px] rounded-full bg-white/10 border border-white/20">
              <Link
                href="/"
                className="h-7 px-2.5 rounded-full text-xs font-medium inline-flex items-center justify-center transition-colors text-white/80 hover:text-white"
              >
                Buy
              </Link>
              {vendor && (
                <Link
                  href="/vendor/dashboard"
                  className="h-7 px-2.5 rounded-full text-xs font-medium inline-flex items-center justify-center transition-colors text-white/80 hover:text-white"
                >
                  Sell
                </Link>
              )}
            </div>
          )}

          {user && !vendor && !isSellingMode && (
            <Link
              href="/vendor/apply"
              className="hidden sm:inline-flex h-8 md:h-9 items-center gap-1.5 rounded-full bg-white text-[#0A4F4F] px-3.5 text-xs font-semibold hover:bg-white/90 transition-opacity shadow-xs"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Start selling</span>
            </Link>
          )}

          {!user && (
            <Link
              href="/login"
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5 text-white/80" />
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
              className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
