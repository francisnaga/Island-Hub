'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SELLER_FLYER_TAGS, trackFlyerEvent } from '@/lib/analytics'

export function SourceTracker() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    try {
      const rawTag = searchParams.get('s')
      let tagToTrack: string | null = null

      if (rawTag) {
        const cleaned = rawTag.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)
        if (cleaned) {
          tagToTrack = cleaned
          // Save first-touch source if not yet set, or preserve current campaign
          localStorage.setItem('jetty_source_tag', cleaned)

          // If visitor scanned a seller flyer (ws, hs, was) and landed on home page, land on /sell
          if (SELLER_FLYER_TAGS.has(cleaned) && pathname === '/') {
            trackFlyerEvent('sell_flow_start', cleaned)
            router.replace(`/sell?s=${cleaned}`)
            return
          }
        }
      } else {
        tagToTrack = localStorage.getItem('jetty_source_tag')
      }

      // Record 1 visit per tag per day
      if (tagToTrack) {
        const today = new Date().toISOString().slice(0, 10)
        const visitKey = `jetty_visit_${tagToTrack}_${today}`
        if (!localStorage.getItem(visitKey)) {
          trackFlyerEvent('visit', tagToTrack)
          localStorage.setItem(visitKey, '1')
        }
      }
    } catch {
      // Non-blocking
    }
  }, [searchParams, pathname, router])

  return null
}
