'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search,
  Store,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  ExternalLink,
  LogIn,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isAdminEmail, UserProfile, Vendor } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { DarkModeToggle } from './DarkModeToggle'
import { JettyMark } from '@/components/brand/JettyMark'

interface NavbarProps {
  user: { id: string; email?: string; full_name?: string; avatar_url?: string } | null
  profile: UserProfile | null
  vendor: Vendor | null
}

export function Navbar({ user, profile, vendor }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isAdmin =
    profile?.role === 'admin' || isAdminEmail(user?.email) || isAdminEmail(profile?.email)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      router.push('/marketplace')
      return
    }
    router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`)
    setMobileMenuOpen(false)
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
    { href: '/marketplace', label: 'Shop' },
    { href: '/category/maritime-cadet-gear', label: 'Cadet Gear' },
    { href: '/fresher-kit', label: 'Fresher Kit' },
    { href: '/housing', label: 'Lodge' },
    { href: '/vendors', label: 'Vendors' },
    { href: '/safety', label: 'Safety' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md">
      {/* Main Navigation Row */}
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Official Jetty Brand Lockup: 32px mark + live lowercase "jetty" wordmark */}
        <Link
          href="/"
          aria-label="Jetty — NMU Campus Marketplace Home"
          className="flex items-center gap-2.5 shrink-0 py-1 pr-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-lg"
        >
          <JettyMark size={32} className="h-8 w-8 shrink-0" />
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
              placeholder="Search safety boots, action rigs, fruit salad..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-muted/60 text-sm text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-[#0F6E6E] focus:outline-none focus:ring-2 focus:ring-[#0F6E6E]/15 transition-all"
            />
          </div>
        </form>

        {/* Desktop Links */}
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

        {/* Right Actions (Desktop) — No Buyer/Vendor mode toggle; public site is already the buyer experience */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <DarkModeToggle />

          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    'inline-flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-[#0A4F4F] text-white'
                      : 'border border-[#E8B84A] bg-[#E8B84A]/15 text-foreground hover:bg-[#E8B84A]/25'
                  )}
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                  Admin Console
                </Link>
              )}

              {vendor ? (
                <>
                  <Link
                    href={`/vendors/${vendor.slug || vendor.id}`}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                    My Storefront
                  </Link>
                  <Link
                    href="/vendor/dashboard"
                    className={cn(
                      'inline-flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors',
                      pathname.startsWith('/vendor/dashboard')
                        ? 'bg-[#0F6E6E] text-white hover:bg-[#0A4F4F]'
                        : 'border border-border bg-card text-foreground hover:bg-muted'
                    )}
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                    Manage Shop
                  </Link>
                </>
              ) : (
                <Link
                  href="/vendor/apply"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#0F6E6E] px-3.5 text-xs font-semibold text-white hover:bg-[#0A4F4F] transition-colors"
                >
                  <Store className="h-3.5 w-3.5" />
                  Create Storefront
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <LogIn className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                Vendor Sign In
              </Link>
              <Link
                href="/vendor/apply"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-foreground text-background px-4 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Store className="h-4 w-4" />
                Become a Vendor
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1.5 md:hidden shrink-0">
          {user && isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex h-10 items-center gap-1 rounded-lg border border-[#E8B84A] bg-[#E8B84A]/15 px-2.5 text-xs font-bold text-foreground"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
              <span>Admin</span>
            </Link>
          ) : user && vendor ? (
            <Link
              href="/vendor/dashboard"
              className="inline-flex h-10 items-center gap-1 rounded-lg bg-[#0F6E6E] px-2.5 text-xs font-semibold text-white"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>My Shop</span>
            </Link>
          ) : (
            <Link
              href="/vendor/apply"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-foreground text-background px-3 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Sell</span>
            </Link>
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
                placeholder="Search safety boots, action rigs, fruit salad..."
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

          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#E8B84A]/20 border border-[#E8B84A] py-2.5 text-xs font-bold text-foreground min-h-10"
                  >
                    <ShieldAlert className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A]" />
                    Admin Moderation &amp; Vendor Console
                  </Link>
                )}

                {vendor ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/vendors/${vendor.slug || vendor.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-xs font-semibold text-foreground min-h-10"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#0F6E6E]" />
                      My Storefront
                    </Link>
                    <Link
                      href="/vendor/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0F6E6E] py-2.5 text-xs font-semibold text-white min-h-10"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Manage Shop
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/vendor/apply"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#0F6E6E] py-2.5 text-xs font-semibold text-white min-h-10"
                  >
                    <Store className="h-4 w-4" />
                    Create Vendor Storefront
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 py-2.5 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 min-h-10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out ({user.email})
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-xs font-semibold text-foreground min-h-10"
                >
                  <LogIn className="h-4 w-4 text-[#0F6E6E]" />
                  Vendor Sign In
                </Link>
                <Link
                  href="/vendor/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-foreground text-background py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity min-h-10"
                >
                  <Store className="h-4 w-4" />
                  Become a Vendor
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
