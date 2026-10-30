'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Bed, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

// Exactly 4 clean, balanced bottom nav tabs with less generic Services icon
const tabs = [
  { href: '/', label: 'Home', icon: Home, exact: true },
  { href: '/marketplace', label: 'Market', icon: ShoppingBag },
  { href: '/housing', label: 'Lodge', icon: Bed },
  { href: '/services', label: 'Services', icon: Briefcase },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  const activePath = pendingHref || pathname

  // Hide on product detail pages so sticky buy bar has the entire bottom
  if (pathname.startsWith('/product/')) {
    return null
  }

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 inset-x-0 z-50 h-[calc(64px+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] border-t border-border bg-card/95 backdrop-blur-md md:hidden transform-gpu will-change-transform"
      style={{ transform: 'translate3d(0, 0, 0)' }}
    >
      <div className="grid h-full grid-cols-4">
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
                'relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors cursor-pointer select-none',
                active
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Clean monochrome state switch: thin stroke when inactive, thick & bold when active */}
              <Icon
                strokeWidth={active ? 2.4 : 1.75}
                className={cn(
                  'h-[22px] w-[22px] shrink-0 transition-all',
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
  )
}
