'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingBag, Bed, Briefcase, Plus, Store } from 'lucide-react'
import { trackFlyerEvent } from '@/lib/analytics'

export function WaterlineHero({ hasStore = false }: { hasStore?: boolean }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [amplitude, setAmplitude] = useState(1)

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isReduced) return

    let rafId: number | null = null
    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const y = window.scrollY || 0
        const amp = Math.max(0.15, 1 - y / 140)
        setAmplitude((prev) => {
          const next = Number(amp.toFixed(2))
          return Math.abs(prev - next) >= 0.03 ? next : prev
        })
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      router.push('/marketplace')
      return
    }
    router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <div id="waterline-hero" data-teal-hero className="relative">
      {/* Deep Teal Hero Water Body */}
      <section className="bg-[#0A4F4F] text-white pt-5 px-4 pb-5 sm:pt-7 sm:px-6 sm:pb-7 md:py-10 md:px-8">
        <div className="mx-auto max-w-xl md:max-w-6xl md:flex md:items-center md:justify-between md:gap-10">
          <div className="md:flex-1 md:max-w-xl">
            <h1 className="font-semibold text-[27px] sm:text-[34px] md:text-[40px] leading-[1.16] tracking-[-0.035em] text-white font-sans">
              Find what you need around <span className="text-[#E8B84A]">NMU</span>
            </h1>
            <p className="mt-1.5 text-[13.5px] sm:text-base text-white/80 font-normal leading-relaxed">
              Rooms, services and items from students and businesses
            </p>

            {/* Search Field */}
            <form onSubmit={handleSearch} role="search" className="mt-4 sm:mt-5">
              <div className="relative flex items-center h-11 sm:h-12 w-full rounded-2xl bg-white text-[#5B6B6B] px-3.5 sm:px-4 shadow-[0_2px_12px_rgba(0,0,0,0.10)] border border-white/20 transition-all focus-within:ring-2 focus-within:ring-[#E8B84A]/40">
                <Search className="h-4.5 w-4.5 text-[#5B6B6B] shrink-0 mr-2.5" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search boots, rooms, haircuts..."
                  className="w-full bg-transparent text-[13.5px] sm:text-sm text-[#0E1B1B] placeholder:text-[#5B6B6B] focus:outline-none"
                />
              </div>
            </form>
          </div>

          {/* The 4 Gateway Doors — Linear-grade Bento Action Cards */}
          <div className="hidden md:grid md:grid-cols-4 gap-2.5 md:mt-0 md:w-[350px] shrink-0">
            <Link
              href="/marketplace"
              className="group relative flex flex-col items-center justify-center gap-1.5 h-[70px] sm:h-[76px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.16] border border-white/[0.10] hover:border-white/[0.22] transition-all duration-200 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] active:scale-[0.97]"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75] text-white/90 group-hover:text-white group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[12px] font-medium text-white/90 group-hover:text-white tracking-tight leading-none">
                Market
              </span>
            </Link>

            <Link
              href="/services"
              className="group relative flex flex-col items-center justify-center gap-1.5 h-[70px] sm:h-[76px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.16] border border-white/[0.10] hover:border-white/[0.22] transition-all duration-200 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] active:scale-[0.97]"
            >
              <Briefcase className="w-5 h-5 stroke-[1.75] text-white/90 group-hover:text-white group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[12px] font-medium text-white/90 group-hover:text-white tracking-tight leading-none">
                Services
              </span>
            </Link>

            <Link
              href="/housing"
              className="group relative flex flex-col items-center justify-center gap-1.5 h-[70px] sm:h-[76px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.16] border border-white/[0.10] hover:border-white/[0.22] transition-all duration-200 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] active:scale-[0.97]"
            >
              <Bed className="w-5 h-5 stroke-[1.75] text-white/90 group-hover:text-white group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[12px] font-medium text-white/90 group-hover:text-white tracking-tight leading-none">
                Lodge
              </span>
            </Link>

            <Link
              href={hasStore ? '/vendor/dashboard' : '/vendor/apply'}
              onClick={() => {
                if (!hasStore) trackFlyerEvent('sell_flow_start')
              }}
              className="group relative flex flex-col items-center justify-center gap-1.5 h-[70px] sm:h-[76px] rounded-xl bg-gradient-to-b from-[#E8B84A] to-[#D4A338] hover:from-[#F0C35B] hover:to-[#DFAC43] text-[#0A2626] border border-[#F5D076] transition-all duration-200 shadow-sm active:scale-[0.97]"
            >
              {hasStore ? (
                <Store className="w-5 h-5 stroke-[2] text-[#0A2626] group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <Plus className="w-5 h-5 stroke-[2.4] text-[#0A2626] group-hover:scale-110 transition-transform duration-200" />
              )}
              <span className="text-[12px] font-bold text-[#0A2626] tracking-tight leading-none whitespace-nowrap">
                {hasStore ? 'My Store' : 'Sell'}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* The Waterline SVG Wave (Gold Crest) — matching prototype exactly with zero stroke clipping */}
      <svg
        className="w-full h-7 block -mt-px pointer-events-none"
        viewBox="0 0 432 28"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ display: 'block', width: '100%', height: '28px', marginTop: '-1px' }}
      >
        <rect width="432" height="28" fill="#0A4F4F" />
        <g
          id="wv"
          style={{
            transformBox: 'fill-box',
            transformOrigin: '50% 100%',
            transform: `scaleY(${amplitude})`,
            willChange: 'transform',
          }}
        >
          <path
            d="M0 14q27-11.5 54 0t54 0t54 0t54 0t54 0t54 0t54 0t54 0V28H0z"
            className="fill-background"
          />
          <path
            d="M0 14q27-11.5 54 0t54 0t54 0t54 0t54 0t54 0t54 0t54 0"
            fill="none"
            stroke="#E8B84A"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  )
}
