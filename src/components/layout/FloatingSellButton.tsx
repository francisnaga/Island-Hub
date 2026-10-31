'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'

export function FloatingSellButton() {
  const pathname = usePathname()

  // Hide on detail pages where the sticky contact bottom bar takes over, or inside vendor dashboard / auth
  const isDetailPage =
    pathname.startsWith('/product/') ||
    (pathname.startsWith('/housing/') && pathname !== '/housing') ||
    pathname.startsWith('/vendor/') ||
    (pathname.startsWith('/vendors/') && pathname !== '/vendors') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth')

  if (isDetailPage) {
    return null
  }

  return (
    <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom)+14px)] right-4 z-40">
      <Link
        href="/vendor/apply"
        aria-label="Sell on Jetty"
        className="flex items-center gap-1.5 h-11 px-4 rounded-full bg-[#0F6E6E] dark:bg-[#E8B84A] text-white dark:text-[#0E1B1B] text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all"
      >
        <Plus className="h-4 w-4 stroke-[2.5]" />
        <span>Sell</span>
      </Link>
    </div>
  )
}
