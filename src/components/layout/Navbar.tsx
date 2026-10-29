'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search,
  Store,
  Menu,
  X,
  UserCircle,
  LayoutDashboard,
  LogOut,
  ArrowLeftRight,
  ShieldAlert,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserProfile, Vendor } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { DarkModeToggle } from './DarkModeToggle'

interface NavbarProps {
  user: { id: string; email?: string } | null
  profile: UserProfile | null
  vendor: Vendor | null
}

export function Navbar({ user, profile, vendor }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMode, setActiveMode] = useState<'buyer' | 'vendor'>(
    profile?.active_mode || (vendor ? 'vendor' : 'buyer')
  )
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      router.push('/marketplace')
      return
    }
    router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`)
    setMobileMenuOpen(false)
  }

  const handleSwitchMode = async () => {
    if (!user) {
      router.push('/login?next=/vendor/apply')
      return
    }

    const targetMode = activeMode === 'buyer' ? 'vendor' : 'buyer'
    setActiveMode(targetMode)

    startTransition(async () => {
      try {
        const supabase = createClient()
        await supabase
          .from('profiles')
          .update({ active_mode: targetMode })
          .eq('id', user.id)
      } catch {
        // Ignore if column not yet migrated
      }

      if (targetMode === 'vendor') {
        if (vendor) {
          toast.success('Switched to Vendor Mode')
          router.push('/vendor/dashboard')
        } else {
          toast.info('Complete your vendor profile to start selling on Jetty')
          router.push('/vendor/apply')
        }
      } else {
        toast.success('Switched to Consumer (Buyer) View')
        router.push('/marketplace')
      }
      router.refresh()
    })
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
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/category/maritime-cadet-gear', label: 'Cadet Gear' },
    { href: '/fresher-kit', label: 'Fresher Kit' },
    { href: '/vendors', label: 'Vendors' },
    { href: '/services', label: 'Services' },
    { href: '/safety', label: 'Safety & Policies' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md">
      {/* Main Navigation Row */}
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Official Jetty Brand Lockup: 32px mark + live lowercase "jetty" wordmark with 10px gap */}
        <Link
          href="/"
          aria-label="Jetty — NMU Campus Marketplace Home"
          className="flex items-center gap-2.5 shrink-0 py-1 pr-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E] rounded-lg"
        >
          <img
            src="/jetty-mark.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0"
          />
          <span className="text-xl font-semibold tracking-[0.02em] text-foreground lowercase leading-none">
            jetty
          </span>
        </Link>

        {/* Quick Search Bar (Desktop) */}
        <form onSubmit={handleSearch} role="search" className="hidden md:flex flex-1 max-w-sm mx-2 min-w-0">
          <div className="relative w-full">
            <label htmlFor="navbar-search-input" className="sr-only">
              Search listings across NMU Okerenkoko and Kurutie
            </label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="navbar-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search safety boots, action rigs, calculators..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-muted/60 text-sm text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-[#0F6E6E] focus:outline-none focus:ring-2 focus:ring-[#0F6E6E]/15 transition-all"
            />
          </div>
        </form>

        {/* Desktop Links — Only the actual current page is highlighted */}
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
                  'px-2.5 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E]',
                  isActive
                    ? 'bg-[#E6F2F2] text-[#0A4F4F] dark:bg-[#132A2A] dark:text-white font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <DarkModeToggle />

          {user ? (
            <>
              <button
                type="button"
                onClick={handleSwitchMode}
                disabled={isPending}
                title="Switch between Buyer (Consumer) and Vendor view"
                className={cn(
                  'inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E]',
                  activeMode === 'vendor'
                    ? 'border-[#0F6E6E]/30 bg-[#E6F2F2] text-[#0A4F4F] dark:bg-[#132A2A] dark:text-white'
                    : 'border-border bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                <span>{activeMode === 'vendor' ? 'Vendor Mode' : 'Buyer Mode'}</span>
              </button>

              {vendor ? (
                <Link
                  href="/vendor/dashboard"
                  className={cn(
                    'inline-flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E]',
                    pathname.startsWith('/vendor/dashboard')
                      ? 'bg-[#0F6E6E] text-white hover:bg-[#0A4F4F]'
                      : 'border border-border bg-card text-foreground hover:bg-muted'
                  )}
                >
                  <Store className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                  Vendor Dashboard
                </Link>
              ) : (
                <Link
                  href="/vendor/apply"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#0F6E6E] px-3.5 text-xs font-semibold text-white hover:bg-[#0A4F4F] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E]"
                >
                  <Store className="h-3.5 w-3.5" />
                  Become a Vendor
                </Link>
              )}

              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={cn(
                    'inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-[#0A4F4F] text-white'
                      : 'border border-[#E8B84A] bg-[#E8B84A]/15 text-foreground hover:bg-[#E8B84A]/25'
                  )}
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-[#0A4F4F] dark:text-[#E8B84A]" />
                  Admin Queue
                </Link>
              )}

              <Link
                href="/profile"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[90px] truncate">{profile?.full_name || 'Profile'}</span>
              </Link>
            </>
          ) : (
            <Link
              href="/vendor/apply"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#0F6E6E] px-4 text-sm font-semibold text-white hover:bg-[#0A4F4F] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E]"
            >
              <Store className="h-4 w-4" />
              Become a Vendor
            </Link>
          )}
        </div>

        {/* Mobile Actions (Minimum 40x40px touch targets) */}
        <div className="flex items-center gap-1.5 md:hidden shrink-0">
          {!user && (
            <Link
              href="/vendor/apply"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#0F6E6E] px-3 text-xs font-semibold text-white hover:bg-[#0A4F4F]"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Become a Vendor</span>
            </Link>
          )}
          {user && (
            <button
              type="button"
              onClick={handleSwitchMode}
              disabled={isPending}
              className="inline-flex h-10 items-center gap-1 rounded-lg border border-border bg-muted px-2.5 text-[11px] font-semibold text-foreground"
            >
              <ArrowLeftRight className="h-3 w-3 text-[#0F6E6E]" />
              {activeMode === 'vendor' ? 'Vendor' : 'Buyer'}
            </button>
          )}
          <DarkModeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 pt-3 pb-5 md:hidden space-y-3 shadow-lg">
          <form onSubmit={handleSearch} role="search">
            <div className="relative">
              <label htmlFor="mobile-navbar-search" className="sr-only">
                Search listings
              </label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                id="mobile-navbar-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search safety boots, action rigs, calculators..."
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-muted text-sm text-foreground focus:bg-card focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>
          </form>

          <nav aria-label="Mobile menu links" className="grid grid-cols-2 gap-1.5">
            {navLinks.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'px-3 py-2.5 rounded-lg text-xs font-medium min-h-10 flex items-center',
                    isActive
                      ? 'bg-[#E6F2F2] text-[#0A4F4F] dark:bg-[#132A2A] dark:text-white font-semibold'
                      : 'text-foreground bg-muted/40 hover:bg-muted'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {user && (
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              {vendor ? (
                <Link
                  href="/vendor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#0F6E6E] py-2.5 text-xs font-semibold text-white min-h-10"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Vendor Dashboard
                </Link>
              ) : (
                <Link
                  href="/vendor/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#E6F2F2] border border-[#0F6E6E]/20 py-2.5 text-xs font-semibold text-[#0A4F4F] min-h-10"
                >
                  <Store className="h-4 w-4" />
                  Become a Vendor
                </Link>
              )}

              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#E8B84A]/15 border border-[#E8B84A] py-2.5 text-xs font-semibold text-foreground min-h-10"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Admin Moderation Queue
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-xs font-semibold text-foreground min-h-10"
                >
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 py-2.5 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 min-h-10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
