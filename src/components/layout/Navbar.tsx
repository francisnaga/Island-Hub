'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Anchor,
  Search,
  Store,
  ShieldCheck,
  Menu,
  X,
  UserCircle,
  LayoutDashboard,
  LogOut,
  ArrowLeftRight,
  ShieldAlert,
  Wrench,
  Home,
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
          toast.info('Complete your vendor profile to start selling on IslandHub')
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
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/category/maritime-cadet-gear', label: 'Cadet Gear', highlight: true },
    { href: '/services', label: 'Services', icon: Wrench },
    { href: '/housing', label: 'Housing', icon: Home },
    { href: '/vendors', label: 'Vendors' },
    { href: '/safety', label: 'Safety & Help' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md">
      {/* Top announcement bar */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-200 text-xs py-1.5 px-4">
        <div className="container mx-auto max-w-7xl flex items-center justify-between gap-2">
          <p className="truncate font-medium">
            <span className="text-teal-400 font-semibold">NMU & Okerenkoko Marketplace</span> · Browse freely, compare prices & order directly on WhatsApp.
          </p>
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <Link href="/safety" className="hover:text-white transition-colors flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              How to Buy Safely
            </Link>
            {!vendor && (
              <Link href="/vendor/apply" className="text-teal-300 hover:text-white font-semibold transition-colors">
                Become a Vendor →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-opacity group-hover:opacity-90">
            <Anchor className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground leading-none">
              IslandHub
            </span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-wide">
              NMU · OKERENKOKO
            </span>
          </div>
        </Link>

        {/* Quick Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search safety boots, action rigs, power banks..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-muted/60 text-sm text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
            />
          </div>
        </form>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70',
                  link.highlight && !isActive && 'text-primary font-semibold'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <DarkModeToggle />

          {user ? (
            <>
              {/* Consumer <-> Vendor Mode Switcher Pill */}
              <button
                type="button"
                onClick={handleSwitchMode}
                disabled={isPending}
                title="Switch between Buyer (Consumer) and Vendor view"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                  activeMode === 'vendor'
                    ? 'border-primary/30 bg-accent text-accent-foreground hover:bg-accent/80'
                    : 'border-border bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
                <span>{activeMode === 'vendor' ? 'Vendor Mode' : 'Buyer Mode'}</span>
              </button>

              {vendor ? (
                <Link
                  href="/vendor/dashboard"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors',
                    pathname.startsWith('/vendor/dashboard')
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card text-foreground hover:bg-muted'
                  )}
                >
                  <Store className="h-3.5 w-3.5 text-primary" />
                  My Shop
                </Link>
              ) : (
                <Link
                  href="/vendor/apply"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-accent/50 px-3.5 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent transition-colors"
                >
                  <Store className="h-3.5 w-3.5" />
                  Sell on IslandHub
                </Link>
              )}

              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                  )}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Admin Queue
                </Link>
              )}

              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[90px] truncate">{profile?.full_name || 'Profile'}</span>
              </Link>
            </>
          ) : (
            /* Unauthenticated: only show Sell button, no Sign In */
            <Link
              href="/vendor/apply"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Store className="h-4 w-4" />
              Sell on IslandHub
            </Link>
          )}
        </div>

        {/* Mobile: Dark Toggle + Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <DarkModeToggle />
          {user && (
            <button
              type="button"
              onClick={handleSwitchMode}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
            >
              <ArrowLeftRight className="h-3 w-3 text-primary" />
              {activeMode === 'vendor' ? 'Vendor' : 'Buyer'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 pt-3 pb-6 md:hidden space-y-4 shadow-lg">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search boots, rigs, electronics..."
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-muted text-sm text-foreground focus:bg-card focus:border-primary focus:outline-none"
              />
            </div>
          </form>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-3 py-2.5 rounded-lg text-sm font-medium',
                  pathname === link.href
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted border border-border/80">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{profile?.full_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Current View: <span className="font-semibold capitalize">{activeMode}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSwitchMode()
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    <ArrowLeftRight className="h-3 w-3" />
                    Switch to {activeMode === 'buyer' ? 'Vendor' : 'Buyer'}
                  </button>
                </div>

                {vendor ? (
                  <Link
                    href="/vendor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Vendor Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/vendor/apply"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-accent border border-primary/20 py-2.5 text-sm font-semibold text-accent-foreground"
                  >
                    <Store className="h-4 w-4" />
                    Apply to Become a Vendor
                  </Link>
                )}

                {profile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 border border-amber-300 py-2.5 text-sm font-semibold text-amber-900 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-300"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Admin Moderation Queue
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold text-foreground"
                  >
                    <UserCircle className="h-4 w-4" />
                    Profile & Role
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              /* No sign-in for buyers — vendor apply only */
              <Link
                href="/vendor/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"
              >
                <Store className="h-4 w-4" />
                Sell on IslandHub
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
