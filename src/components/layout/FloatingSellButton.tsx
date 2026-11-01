'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, Store } from 'lucide-react'
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

  // Hide on detail pages where the sticky contact bottom bar takes over, or inside vendor dashboard / auth / admin
  const isDetailPage =
    pathname.startsWith('/product/') ||
    (pathname.startsWith('/housing/') && pathname !== '/housing') ||
    pathname.startsWith('/services/') ||
    pathname.startsWith('/vendor') ||
    (pathname.startsWith('/vendors/') && pathname !== '/vendors') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth')

  if (isDetailPage) {
    return null
  }

  if (hasStore) {
    return (
      <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px)+12px)] md:bottom-6 right-4 z-40">
        <Link
          href="/vendor/dashboard"
          aria-label="Open your vendor store"
          className="flex items-center gap-1.5 h-11 px-4 rounded-full bg-foreground text-background text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all"
        >
          <Store className="h-4 w-4 stroke-[2]" />
          <span>Open store</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px)+12px)] md:bottom-6 right-4 z-40">
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

