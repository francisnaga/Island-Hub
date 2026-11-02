'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, Store, Wrench, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FloatingSellButtonProps {
  initialHasStore?: boolean
}

export function FloatingSellButton({ initialHasStore = false }: FloatingSellButtonProps) {
  const pathname = usePathname()
  const [hasStore, setHasStore] = useState(initialHasStore)

  useEffect(() => {
    setHasStore(initialHasStore)
  }, [initialHasStore])

  useEffect(() => {
    let mounted = true
    const checkStore = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          if (mounted) setHasStore(false)
          return
        }

        const { data: vendor } = await supabase
          .from('vendors')
          .select('id, shop_name, whatsapp_number')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (mounted && vendor && vendor.shop_name && vendor.whatsapp_number) {
          setHasStore(true)
        }
      } catch {
        // Fail silently
      }
    }

    checkStore()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkStore()
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Hide on home page (hero already has dedicated Sell/Open store gateway button)
  // Also hide on detail pages where sticky contact bar takes over, or vendor dashboard / auth / admin
  const shouldHide =
    pathname === '/' ||
    pathname.startsWith('/product/') ||
    (pathname.startsWith('/housing/') && pathname !== '/housing') ||
    pathname.startsWith('/services/') ||
    pathname.startsWith('/vendor') ||
    (pathname.startsWith('/vendors/') && pathname !== '/vendors') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth')

  if (shouldHide) {
    return null
  }

  // Context-aware label and destination based on current page
  const isServicesTab = pathname === '/services' || pathname.startsWith('/services')
  const isHousingTab = pathname === '/housing'

  if (hasStore) {
    // On services page: go list a service; on housing: go post a room; elsewhere: open dashboard
    const dashHref = isServicesTab
      ? '/vendor/dashboard?tab=listings&type=service'
      : isHousingTab
      ? '/vendor/dashboard?tab=listings&type=housing'
      : '/vendor/dashboard'
    const dashLabel = isServicesTab ? 'List a service' : isHousingTab ? 'Post a room' : 'Open store'
    const DashIcon = isServicesTab ? Wrench : isHousingTab ? Home : Store

    return (
      <div className="md:hidden fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px)+12px)] right-4 z-40">
        <Link
          href={dashHref}
          aria-label={dashLabel}
          className="flex items-center gap-1.5 h-11 px-4 rounded-full bg-foreground text-background text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all"
        >
          <DashIcon className="h-4 w-4 stroke-[2]" />
          <span>{dashLabel}</span>
        </Link>
      </div>
    )
  }

  // Context-aware for unauthenticated / no store yet
  const applyHref = isServicesTab
    ? '/vendor/apply?type=service'
    : isHousingTab
    ? '/vendor/apply?type=housing'
    : '/vendor/apply'
  const applyLabel = isServicesTab ? 'List a service' : isHousingTab ? 'Post a room' : 'Sell'
  const ApplyIcon = isServicesTab ? Wrench : isHousingTab ? Home : Plus

  return (
    <div className="md:hidden fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px)+12px)] right-4 z-40">
      <Link
        href={applyHref}
        aria-label={applyLabel}
        className="flex items-center gap-1.5 h-11 px-4 rounded-full bg-[#0F6E6E] dark:bg-[#E8B84A] text-white dark:text-[#0E1B1B] text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all"
      >
        <ApplyIcon className="h-4 w-4 stroke-[2.5]" />
        <span>{applyLabel}</span>
      </Link>
    </div>
  )
}

