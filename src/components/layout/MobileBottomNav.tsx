'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, ShoppingBag, CheckSquare, Wrench, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: 'Home', icon: Compass, exact: true },
  { href: '/marketplace', label: 'Shop', icon: ShoppingBag },
  { href: '/fresher-kit', label: 'Cadet Kit', icon: CheckSquare },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/housing', label: 'Housing', icon: Home },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 inset-x-0 z-50 h-15 border-t border-border bg-card/95 backdrop-blur-md md:hidden"
    >
      <div className="grid h-full grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                active
                  ? 'text-[#0F6E6E] dark:text-[#E8B84A] font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate max-w-[64px]">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
