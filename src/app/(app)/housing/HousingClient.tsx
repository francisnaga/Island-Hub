'use client'

import { useState } from 'react'
import { Building2 } from 'lucide-react'
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
  { id: 'Single room', label: 'Single room' },
  { id: 'Shared room', label: 'Shared room' },
  { id: 'Bedspace', label: 'Bedspace' },
  { id: 'Flat / 2-Bed', label: 'Flat / 2-Bed' },
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
      {/* Page Header matching Prototype */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="space-y-1">
          <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-foreground font-sans leading-tight">
            Lodge
          </h1>
          <p className="text-[14px] text-muted-foreground">
            Rooms and hostels near campus.
          </p>
        </div>
        <div className="shrink-0 pt-1 text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-muted-foreground font-mono-num shadow-2xs">
            {filteredLodges.length} {filteredLodges.length === 1 ? 'room' : 'rooms'}
          </span>
        </div>
      </div>

      {/* Room Type Filter Pills */}
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
                'h-8 sm:h-9 px-4 rounded-full text-xs font-medium whitespace-nowrap border transition-all cursor-pointer shrink-0',
                active
                  ? 'bg-foreground text-background border-foreground font-semibold shadow-2xs'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Responsive Room Grid (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
      {filteredLodges.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 pt-2">
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
    </div>
  )
}
