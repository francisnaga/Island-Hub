'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingBag, Bed, Briefcase, Plus, Store } from 'lucide-react'

export function WaterlineHero({ hasStore = false }: { hasStore?: boolean }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [amplitude, setAmplitude] = useState(1)

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isReduced) return

    const handleScroll = () => {
      const y = window.scrollY || 0
      const amp = Math.max(0.15, 1 - y / 140)
      setAmplitude(Number(amp.toFixed(3)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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
    <div className="relative">
      {/* Deep Teal Hero Water Body */}
      <section className="bg-[#0A4F4F] text-white pt-4 px-4 pb-1 sm:pt-6 sm:px-6 md:py-6">
        <div className="mx-auto max-w-xl md:max-w-6xl md:flex md:items-center md:justify-between md:gap-10">
          <div className="md:flex-1 md:max-w-xl">
            <h1 className="font-[family-name:var(--font-bricolage)] font-semibold text-[28px] sm:text-[34px] md:text-[40px] leading-[1.08] tracking-[-0.01em] text-white">
              Everything NMU,<br />one jetty away.
            </h1>
            <p className="mt-2 text-sm md:text-base text-white/80 font-normal">
              Rooms, services and gear from verified students.
            </p>

            {/* Search Field */}
            <form onSubmit={handleSearch} role="search" className="mt-4">
              <div className="relative flex items-center h-12 w-full rounded-[14px] bg-white text-[#5B6B6B] px-3.5 shadow-sm">
                <Search className="h-5 w-5 text-[#5B6B6B] shrink-0 mr-2.5" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items, rooms, stores, or services..."
                  className="w-full bg-transparent text-sm text-[#0E1B1B] placeholder:text-[#5B6B6B] focus:outline-none"
                />
              </div>
            </form>
          </div>

          {/* The 4 Gateway Doors */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4.5 md:mt-0 pb-2 md:pb-0 md:w-[340px] shrink-0">
            <Link
              href="/marketplace"
              className="flex flex-col items-center gap-2 text-[13px] font-medium text-white group"
            >
              <span className="w-full max-w-[76px] aspect-square rounded-[18px] bg-white/[0.09] border border-white/[0.16] flex items-center justify-center transition-transform active:scale-95 group-hover:bg-white/[0.14]">
                <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
              </span>
              <span>Market</span>
            </Link>

            <Link
              href="/housing"
              className="flex flex-col items-center gap-2 text-[13px] font-medium text-white group"
            >
              <span className="w-full max-w-[76px] aspect-square rounded-[18px] bg-white/[0.09] border border-white/[0.16] flex items-center justify-center transition-transform active:scale-95 group-hover:bg-white/[0.14]">
                <Bed className="w-6 h-6 stroke-[1.75]" />
              </span>
              <span>Lodge</span>
            </Link>

            <Link
              href="/services"
              className="flex flex-col items-center gap-2 text-[13px] font-medium text-white group"
            >
              <span className="w-full max-w-[76px] aspect-square rounded-[18px] bg-white/[0.09] border border-white/[0.16] flex items-center justify-center transition-transform active:scale-95 group-hover:bg-white/[0.14]">
                <Briefcase className="w-6 h-6 stroke-[1.75]" />
              </span>
              <span>Services</span>
            </Link>

            <Link
              href={hasStore ? '/vendor/dashboard' : '/vendor/apply'}
              className="flex flex-col items-center gap-2 text-[13px] font-medium text-white group"
            >
              <span className="w-full max-w-[76px] aspect-square rounded-[18px] bg-[#E8B84A] border border-[#E8B84A] text-[#0E1B1B] flex items-center justify-center transition-transform active:scale-95 shadow-sm">
                {hasStore ? (
                  <Store className="w-6 h-6 stroke-[2]" />
                ) : (
                  <Plus className="w-6.5 h-6.5 stroke-[2.2]" />
                )}
              </span>
              <span className="whitespace-nowrap">{hasStore ? 'Open store' : 'Sell'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The Waterline SVG Wave (Gold Crest) */}
      <svg
        className="w-full h-7 block -mt-px pointer-events-none"
        viewBox="0 0 432 28"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <rect width="432" height="28" fill="#0A4F4F" />
        <g style={{ transformOrigin: '50% 100%', transform: `scaleY(${amplitude})` }}>
          <path
            d="M0 14q27-14 54 0t54 0t54 0t54 0t54 0t54 0t54 0t54 0V28H0z"
            className="fill-background"
          />
          <path
            d="M0 14q27-14 54 0t54 0t54 0t54 0t54 0t54 0t54 0t54 0"
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
