'use client'

import { useState } from 'react'
import { LodgeListing } from '@/lib/lodge-data'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'

interface HousingClientProps {
  initialLodges: LodgeListing[]
  selectedCampus?: string
  initialCampus?: string
  initialType?: string
}

export function HousingClient({
  initialLodges,
  selectedCampus,
  initialCampus,
}: HousingClientProps) {
  const activeCampus = selectedCampus || initialCampus || 'all'
  const [lodges] = useState<LodgeListing[]>(initialLodges)

  const filteredLodges = lodges.filter((lodge) => {
    if (activeCampus && activeCampus !== 'all') {
      if (lodge.campus !== 'Both' && lodge.campus.toLowerCase() !== activeCampus.toLowerCase()) {
        return false
      }
    }
    return true
  })

  return (
    <div className="space-y-4 min-w-0 pb-16">
      {/* Page Header Matching Uploaded Image 1 */}
      <div className="space-y-1">
        <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-foreground font-[family-name:var(--font-bricolage)] leading-tight">
          Lodge
        </h1>
        <p className="text-[14px] text-muted-foreground">
          Rooms and hostels near campus.
        </p>
      </div>

      {/* 2-Column Exact Room Grid Matching Uploaded Image 1 */}
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

      {filteredLodges.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center max-w-sm mx-auto my-8 space-y-2">
          <p className="text-base font-bold text-foreground">No rooms in this area</p>
          <p className="text-xs text-muted-foreground">
            Switch your campus selector to &quot;Both campuses&quot; to see all available listings.
          </p>
        </div>
      )}
    </div>
  )
}
