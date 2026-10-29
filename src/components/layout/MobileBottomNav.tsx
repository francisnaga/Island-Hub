'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Bed, Scissors, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: 'Home', icon: Home, exact: true },
  { href: '/marketplace', label: 'Market', icon: ShoppingBag },
  { href: '/housing', label: 'Lodge', icon: Bed },
  { href: '/services', label: 'Services', icon: Scissors },
  { href: '/vendors', label: 'Vendors', icon: Store },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  const activePath = pendingHref || pathname

  // Hide on product detail pages so the dedicated sticky buy bar has the entire mobile screen
  if (pathname.startsWith('/product/')) {
    return null
  }

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 inset-x-0 z-50 h-[calc(60px+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] border-t border-border bg-card/95 backdrop-blur-md md:hidden transform-gpu will-change-transform"
      style={{ transform: 'translate3d(0, 0, 0)' }}
    >
      <div className="grid h-full grid-cols-5">
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
                'relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary',
                active
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
              )}
              <Icon
                strokeWidth={1.8}
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform',
                  isPending && 'animate-pulse scale-110'
                )}
              />
              <span className="truncate max-w-[68px] leading-tight">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
