'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, ShoppingBag, Anchor, CheckSquare, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: 'Home', icon: Compass, exact: true },
  { href: '/marketplace', label: 'Shop', icon: ShoppingBag },
  { href: '/category/maritime-cadet-gear', label: 'Cadet Gear', icon: Anchor },
  { href: '/fresher-kit', label: 'Fresher Kit', icon: CheckSquare },
  { href: '/vendors', label: 'Vendors', icon: Store },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  const activePath = pendingHref || pathname

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 inset-x-0 z-50 h-15 border-t border-border bg-card/95 backdrop-blur-md md:hidden"
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
                'relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary',
                active
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
              )}
              <Icon
                className={cn(
                  'h-4.5 w-4.5 shrink-0 transition-transform',
                  isPending && 'animate-pulse scale-110'
                )}
              />
              <span className="truncate max-w-[68px]">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
