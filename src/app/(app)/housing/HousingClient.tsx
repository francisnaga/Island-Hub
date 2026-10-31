'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  MapPin,
  BadgeCheck,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'
import { LodgeListing } from '@/lib/lodge-data'

interface HousingClientProps {
  initialLodges: LodgeListing[]
  initialCampus?: string
  initialType?: string
}

export function HousingClient({
  initialLodges,
  initialCampus = 'all',
  initialType = 'all',
}: HousingClientProps) {
  const searchParams = useSearchParams()
  const [selectedType, setSelectedType] = useState(initialType.toLowerCase())
  const activeCampus = (searchParams.get('campus') || initialCampus).toLowerCase()

  // Instant client-side filtering — 0ms latency even on 2G/poor network
  const filteredLodges = initialLodges.filter((item) => {
    if (activeCampus !== 'all' && item.campus.toLowerCase() !== activeCampus) {
      return false
    }
    if (selectedType !== 'all' && item.room_type.toLowerCase() !== selectedType) {
      return false
    }
    return true
  })

  const handleTypeChange = (t: string) => {
    const nextType = t.toLowerCase()
    setSelectedType(nextType)
    const sp = new URLSearchParams(window.location.search)
    if (nextType === 'all') {
      sp.delete('type')
    } else {
      sp.set('type', nextType)
    }
    const query = sp.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
  }

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      {/* Page Header */}
      <div className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-[family-name:var(--font-bricolage)]">
            Lodge &amp; Bedspaces
          </h1>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {filteredLodges.length} available
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Verified student hostels and bedspaces across NMU Okerenkoko &amp; Kurutie campuses.
        </p>
      </div>

      {/* Prominent High-Contrast Safety Alert Banner (100% visible on both Light & Dark modes) */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 flex items-start gap-3.5 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100 shadow-2xs">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100 mt-0.5">
          <AlertTriangle className="h-4.5 w-4.5" />
        </div>
        <div className="space-y-1 min-w-0">
          <p className="font-bold text-sm text-amber-950 dark:text-amber-100">
            Safety Rule: Always Inspect in Person Before Paying Any Rent
          </p>
          <p className="text-xs text-amber-900/90 dark:text-amber-200 leading-relaxed">
            Never pay inspection fees, agent fees, or advance rent before visiting the property in person and confirming the caretaker on campus. Legitimate NMU landlords never charge an inspection fee.
          </p>
        </div>
      </div>

      {/* Clean Room Type Filter Strip */}
      <div className="rounded-2xl border border-border/80 bg-card p-2 sm:p-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap shadow-2xs">
        {[
          { id: 'all', label: 'All Listings' },
          { id: 'self_contain', label: 'Self-Contain' },
          { id: 'single_room', label: 'Single Room' },
          { id: 'bedspace', label: 'Bedspace' },
        ].map((t) => {
          const active = selectedType === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTypeChange(t.id)}
              className={cn(
                'h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center transition-colors cursor-pointer shrink-0 whitespace-nowrap',
                active
                  ? 'bg-foreground text-background font-bold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Modern 16:10 Wide Lodge Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredLodges.map((lodge) => {
          const waText = encodeURIComponent(
            `Hi ${lodge.contact_name}! 👋 I saw your lodge listing "${lodge.title}" (₦${lodge.price.toLocaleString('en-NG')} ${lodge.period}) on Jetty. I would like to schedule an in-person room inspection.`
          )
          const waUrl = `https://wa.me/${lodge.whatsapp_number}?text=${waText}`

          return (
            <div
              key={lodge.id}
              className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card overflow-hidden transition-all hover:border-foreground/30 hover:shadow-sm"
            >
              {/* Wide 16:10 Photography */}
              <Link href={`/housing/${lodge.id}`} className="block relative aspect-[16/10] w-full bg-muted overflow-hidden">
                <img
                  src={lodge.image}
                  alt={lodge.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span className="rounded-lg bg-slate-950/85 backdrop-blur-xs border border-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                    {lodge.room_type_label}
                  </span>
                  <span className="rounded-lg bg-slate-950/85 backdrop-blur-xs border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                    {lodge.campus}
                  </span>
                </div>
              </Link>

              {/* Details Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-[family-name:var(--font-bricolage)]">
                      ₦{lodge.price.toLocaleString('en-NG')}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      / {lodge.period}
                    </span>
                  </div>

                  <Link href={`/housing/${lodge.id}`} className="block hover:underline">
                    <h2 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                      {lodge.title}
                    </h2>
                  </Link>

                  <div className="space-y-1 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
                      <span className="truncate">{lodge.location_label}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground pl-5">
                      {lodge.distance_hint}
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {lodge.features.map((f) => (
                      <span
                        key={f}
                        className="rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground/80"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions & WhatsApp Contact */}
                <div className="pt-3 border-t border-border/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate font-medium">{lodge.contact_name}</span>
                    {lodge.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F6E6E] dark:text-[#E8B84A]">
                        <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                        <span>Verified Caretaker</span>
                      </span>
                    )}
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
                  >
                    <WhatsAppIcon className="h-4 w-4 shrink-0" />
                    <span>Inspect Room on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredLodges.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">
            No student rooms match your selected filter.
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Try switching your campus or room type filter to &quot;All&quot;.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleTypeChange('all')}
              className="inline-flex h-9 items-center px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
