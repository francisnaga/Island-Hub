'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, ChevronRight } from 'lucide-react'
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
}: HousingClientProps) {
  const activeCampus = selectedCampus || initialCampus || 'all'
  const [lodges] = useState<LodgeListing[]>(initialLodges)
  const [roomFilter, setRoomFilter] = useState(initialType || 'all')

  const filteredLodges = lodges.filter((lodge) => {
    if (activeCampus && activeCampus !== 'all') {
      if (
        lodge.campus !== 'Both' &&
        lodge.campus.toLowerCase() !== activeCampus.toLowerCase()
      ) {
        return false
      }
    }

    if (roomFilter && roomFilter !== 'all') {
      const normalizedFilter = roomFilter.toLowerCase().replace(/[-_]/g, ' ')
      const labelMatch =
        lodge.room_type_label.toLowerCase().replace(/[-_]/g, ' ') ===
        normalizedFilter
      const typeMatch =
        lodge.room_type.toLowerCase().replace(/[-_]/g, ' ') ===
        normalizedFilter
      if (!labelMatch && !typeMatch) return false
    }

    return true
  })

  return (
    <div className="space-y-4 min-w-0 pb-16">
      {/* Page Header matching Image 1: Title + Right Counter */}
      <div className="flex items-baseline justify-between gap-4 pt-1">
        <h1 className="text-[30px] sm:text-[34px] font-bold tracking-tight text-foreground font-sans leading-none">
          Lodge
        </h1>
        <span className="text-[14px] sm:text-[15px] font-normal text-muted-foreground tabular-nums">
          {filteredLodges.length} {filteredLodges.length === 1 ? 'room' : 'rooms'}
        </span>
      </div>
      <p className="-mt-2 text-[14px] sm:text-[15px] text-muted-foreground">
        Rooms and hostels near campus.
      </p>

      {/* Room Type Filter Pills matching Image 1 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
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
                'h-9 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0',
                active
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                  : 'bg-[#EAEAEA] dark:bg-muted text-foreground/80 hover:bg-[#DFDFDF] dark:hover:bg-muted/80'
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Full-width Room Listings (1 col mobile, stretching through, 2-3 cols desktop) */}
      {filteredLodges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7 pt-2">
          {filteredLodges.map((lodge) => (
            <WaterlineRoomCard
              key={lodge.id}
              lodge={lodge}
              selectedCampus={selectedCampus}
              variant="grid"
            />
          ))}
        </div>
      ) : roomFilter !== 'all' && lodges.length > 0 ? (
        <div className="py-14 px-4 text-center rounded-2xl border border-dashed border-border bg-card/40 my-4">
          <p className="text-sm font-medium text-foreground">
            No {roomFilter.toLowerCase()}s found for this campus
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try switching room category or viewing all campus rooms.
          </p>
          <button
            type="button"
            onClick={() => setRoomFilter('all')}
            className="inline-block mt-3 text-xs font-semibold px-4 py-2 rounded-full bg-muted border border-border text-foreground hover:bg-muted/80 cursor-pointer transition-colors"
          >
            Show all rooms
          </button>
        </div>
      ) : (
        <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-border bg-card/40 my-4">
          <Building2 className="mx-auto w-8 h-8 text-muted-foreground/60 mb-2 stroke-[1.5]" />
          <p className="text-sm font-medium text-foreground">
            No rooms listed for this campus yet
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Check back soon or select another campus from the top bar.
          </p>
        </div>
      )}

      {/* Bottom CTA matching Image 4: Have a room to rent? Post it on Jetty > */}
      <div className="rounded-2xl bg-[#EAEAEA] dark:bg-card border border-border/80 py-4 px-4 text-center mt-6">
        <p className="text-[14px] text-muted-foreground">
          Have a room to rent?{' '}
          <Link
            href="/vendor/apply"
            className="font-semibold text-[#0F6E6E] dark:text-[#22D3EE] hover:underline inline-flex items-center gap-0.5"
          >
            <span>Post it on Jetty</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </p>
      </div>
    </div>
  )
}
