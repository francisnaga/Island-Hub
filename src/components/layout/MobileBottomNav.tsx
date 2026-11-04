'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Bed, Briefcase, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

// Exactly 4 clean, balanced bottom nav tabs with Services before Lodge (Lodge at the end)
const tabs = [
  { href: '/', label: 'Home', icon: Home, exact: true },
  { href: '/marketplace', label: 'Market', icon: ShoppingBag },
  { href: '/services', label: 'Services', icon: Briefcase },
  { href: '/housing', label: 'Lodge', icon: Bed },
]

export function MobileBottomNav({ hasStore = false }: { hasStore?: boolean }) {
  const pathname = usePathname()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  const activePath = pendingHref || pathname

  // Hide on detail pages, vendor flow (onboarding/dashboard/forms), and admin console
  if (
    pathname.startsWith('/product/') ||
    (pathname.startsWith('/housing/') && pathname !== '/housing') ||
    pathname.startsWith('/vendor') ||
    pathname.startsWith('/admin')
  ) {
    return null
  }

  return (
    <>
      {/* Spacer so page content & footer are never covered by the bottom nav */}
      <div
        className="h-[calc(52px+env(safe-area-inset-bottom,0px))] md:hidden shrink-0 pointer-events-none"
        aria-hidden="true"
      />
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden pt-1 pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="grid h-[50px] grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = tab.exact
              ? activePath === tab.href
              : activePath === tab.href || activePath.startsWith(tab.href + '/')
            const isPending = pendingHref === tab.href && pathname !== tab.href

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => {
                  if (pathname !== tab.href) {
                    setPendingHref(tab.href)
                  }
                }}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium transition-colors cursor-pointer select-none',
                  active
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {/* Clean monochrome state switch: thin stroke when inactive, thick & bold when active */}
                <Icon
                  strokeWidth={active ? 2.4 : 1.75}
                  className={cn(
                    'h-5 w-5 shrink-0 transition-all',
                    active && 'scale-105',
                    isPending && 'animate-pulse opacity-80'
                  )}
                />
                <span className="truncate max-w-[72px] leading-none tracking-tight">
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
