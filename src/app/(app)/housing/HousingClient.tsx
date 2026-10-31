'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, X, Building2, ShieldCheck, Plus } from 'lucide-react'
import { LodgeListing } from '@/lib/lodge-data'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { cn } from '@/lib/utils'

interface HousingClientProps {
  initialLodges: LodgeListing[]
  selectedCampus?: string
  initialCampus?: string
  initialType?: string
  initialQuery?: string
}

const ROOM_FILTERS = [
  { id: 'all', label: 'All rooms' },
  { id: 'Self-contain', label: 'Self-contain' },
  { id: 'Shared room', label: 'Shared room' },
  { id: 'Private room', label: 'Private room' },
  { id: 'Bedspace', label: 'Bedspace' },
]

export function HousingClient({
  initialLodges,
  selectedCampus,
  initialCampus,
  initialType = 'all',
  initialQuery = '',
}: HousingClientProps) {
  const activeCampus = selectedCampus || initialCampus || 'all'
  const [lodges] = useState<LodgeListing[]>(initialLodges)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [roomFilter, setRoomFilter] = useState(initialType || 'all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')

  const hasActiveFilters = Boolean(searchQuery.trim() || (roomFilter && roomFilter !== 'all'))

  const filteredLodges = lodges
    .filter((lodge) => {
      if (activeCampus && activeCampus !== 'all') {
        if (lodge.campus !== 'Both' && lodge.campus.toLowerCase() !== activeCampus.toLowerCase()) {
          return false
        }
      }

      if (roomFilter && roomFilter !== 'all') {
        const normalizedFilter = roomFilter.toLowerCase().replace(/[-_]/g, ' ')
        const labelMatch = lodge.room_type_label.toLowerCase().replace(/[-_]/g, ' ') === normalizedFilter
        const typeMatch = lodge.room_type.toLowerCase().replace(/[-_]/g, ' ') === normalizedFilter
        if (!labelMatch && !typeMatch) return false
      }

      if (searchQuery.trim()) {
        const needle = searchQuery.trim().toLowerCase()
        const haystack = [
          lodge.title,
          lodge.room_type_label,
          lodge.campus,
          lodge.location_label,
          lodge.distance_hint,
          lodge.description || '',
          lodge.utilities || '',
          ...(lodge.features || []),
        ]
          .join(' ')
          .toLowerCase()
        const tokens = needle.split(/\s+/).filter(Boolean)
        if (!tokens.every((t) => haystack.includes(t))) {
          return false
        }
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      return 0
    })

  return (
    <div className="space-y-4 min-w-0 pb-16">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-foreground font-[family-name:var(--font-bricolage)] leading-tight">
            Lodge
          </h1>
          <p className="text-[14px] text-muted-foreground">
            Rooms and hostels near campus.
          </p>
        </div>

        <Link
          href="/vendor/products/new?type=housing"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#0A4F4F] text-white text-xs font-semibold hover:bg-[#0F6E6E] transition-colors shrink-0 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Post a room</span>
        </Link>
      </div>

      {/* Scoped Search Bar & Room Type / Rent Filters */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search self-contain, Kurutie, hostel, water..."
              className="w-full h-11 pl-10 pr-9 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:border-[#0F6E6E] focus:outline-none transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sort rooms"
            className="h-11 px-3.5 rounded-xl border border-border bg-card text-xs sm:text-sm font-medium text-foreground focus:border-[#0F6E6E] focus:outline-none shadow-2xs"
          >
            <option value="newest">Sort: Featured &amp; Newest</option>
            <option value="price_asc">Rent: Low to High</option>
            <option value="price_desc">Rent: High to Low</option>
          </select>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ROOM_FILTERS.map((f) => {
            const active =
              f.id === 'all'
                ? !roomFilter || roomFilter === 'all'
                : roomFilter.toLowerCase() === f.id.toLowerCase()
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setRoomFilter(f.id)}
                className={cn(
                  'h-8 px-3.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors cursor-pointer shrink-0',
                  active
                    ? 'bg-[#0A4F4F] border-[#0A4F4F] text-white dark:bg-[#E8B84A] dark:border-[#E8B84A] dark:text-[#0E1B1B] font-semibold'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2-Column Room Grid */}
      {filteredLodges.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 pt-1">
          {filteredLodges.map((lodge) => (
            <WaterlineRoomCard
              key={lodge.id}
              lodge={lodge}
              selectedCampus={selectedCampus}
              variant="grid"
            />
          ))}
        </div>
      ) : hasActiveFilters && lodges.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 text-center max-w-md mx-auto my-6 space-y-3 shadow-2xs">
          <div className="w-11 h-11 rounded-2xl bg-[#E6F2F2] dark:bg-[#132A2A] text-[#0F6E6E] dark:text-[#E8B84A] flex items-center justify-center mx-auto">
            <Search className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">No rooms match your filter</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Try clearing your search keyword or switching the room type filter to see all verified lodges.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setRoomFilter('all')
            }}
            className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reset search &amp; filters
          </button>
        </div>
      ) : (
        /* High-Converting Empty State when 0 approved rooms exist */
        <div className="rounded-2xl border border-border/80 bg-card p-7 sm:p-10 text-center max-w-lg mx-auto my-6 space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F2F2] dark:bg-[#132A2A] text-[#0A4F4F] dark:text-[#E8B84A] flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6 stroke-[1.75]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-foreground font-[family-name:var(--font-bricolage)]">
              Have a student room or self-contain near NMU?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Every lodge on Jetty is verified by Admin before going live so students can schedule viewings directly on WhatsApp without fake inspection fees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Link
              href="/vendor/products/new?type=housing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#0A4F4F] hover:bg-[#0F6E6E] text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
              <span>List a Room for Admin Approval</span>
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
            <span>Direct WhatsApp enquiries · Verified caretakers &amp; student landlords</span>
          </div>
        </div>
      )}
    </div>
  )
}
