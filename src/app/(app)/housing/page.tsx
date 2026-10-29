import Link from 'next/link'
import {
  Home,
  MapPin,
  MessageCircle,
  BadgeCheck,
  AlertTriangle,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'

import { LODGE_LISTINGS, LodgeListing } from '@/lib/lodge-data'

export const dynamic = 'force-dynamic'

export default async function HousingPage({
  searchParams,
}: {
  searchParams: Promise<{ campus?: string; type?: string }>
}) {
  const sp = await searchParams
  const selectedCampus = sp.campus || 'all'
  const selectedType = sp.type || 'all'

  const filteredLodges = LODGE_LISTINGS.filter((item) => {
    if (selectedCampus !== 'all' && item.campus.toLowerCase() !== selectedCampus.toLowerCase()) {
      return false
    }
    if (selectedType !== 'all' && item.room_type !== selectedType) {
      return false
    }
    return true
  })

  return (
    <div className="py-5 sm:py-8 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-5 sm:space-y-6 min-w-0">
        {/* Header & Post Lodge Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                Lodge &amp; Bedspaces
              </h1>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {filteredLodges.length} available
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Off-campus student hostels and bedspaces across Okerenkoko &amp; Kurutie
            </p>
          </div>

          <Link
            href="/vendor/apply"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-foreground text-background px-4 text-xs font-semibold hover:opacity-90 transition-opacity shrink-0 self-start sm:self-auto"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>List a Room or Bedspace</span>
          </Link>
        </div>

        {/* Safety Banner */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 sm:p-3.5 flex items-start gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300">Safety First: </span>
            <span>
              Always inspect the room in person and confirm the caretaker before paying rent. Legitimate landlords around NMU do not charge inspection fees.
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-border/60 pb-3">
          {/* Campus filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Campuses' },
              { id: 'okerenkoko', label: 'Okerenkoko' },
              { id: 'kurutie', label: 'Kurutie' },
            ].map((c) => {
              const active = selectedCampus.toLowerCase() === c.id
              return (
                <Link
                  key={c.id}
                  href={`/housing?campus=${c.id}${selectedType !== 'all' ? `&type=${selectedType}` : ''}`}
                  className={cn(
                    'h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center transition-colors',
                    active
                      ? 'bg-foreground text-background'
                      : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                  )}
                >
                  {c.label}
                </Link>
              )
            })}
          </div>

          <div className="hidden sm:block h-4 w-px bg-border mx-1" />

          {/* Room type filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Types' },
              { id: 'self_contain', label: 'Self-Contain' },
              { id: 'single_room', label: 'Single Room' },
              { id: 'bedspace', label: 'Bedspace' },
            ].map((t) => {
              const active = selectedType === t.id
              return (
                <Link
                  key={t.id}
                  href={`/housing?type=${t.id}${selectedCampus !== 'all' ? `&campus=${selectedCampus}` : ''}`}
                  className={cn(
                    'h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center transition-colors',
                    active
                      ? 'bg-foreground text-background'
                      : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Visual Lodge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredLodges.map((lodge) => {
            const waText = encodeURIComponent(
              `Hi ${lodge.contact_name}! 👋 I saw your lodge listing "${lodge.title}" (₦${lodge.price.toLocaleString('en-NG')} ${lodge.period}) on Jetty. I would like to schedule an in-person room inspection.`
            )
            const waUrl = `https://wa.me/${lodge.whatsapp_number}?text=${waText}`

            return (
              <div
                key={lodge.id}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/60 hover:shadow-lg"
              >
                {/* Visual Image */}
                <div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
                  <img
                    src={lodge.image}
                    alt={lodge.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="rounded-md bg-slate-950/85 backdrop-blur-xs border border-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {lodge.room_type_label}
                    </span>
                    <span className="rounded-md bg-slate-950/85 backdrop-blur-xs border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {lodge.campus}
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                        ₦{lodge.price.toLocaleString('en-NG')}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        / {lodge.period}
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                      {lodge.title}
                    </h2>

                    <div className="space-y-1 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
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
                          className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground/80"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & WhatsApp Contact */}
                  <div className="pt-3 border-t border-border/70 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate">{lodge.contact_name}</span>
                      {lodge.is_verified && (
                        <BadgeCheck className="h-4 w-4 text-primary shrink-0" aria-label="Verified" />
                      )}
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:opacity-90 transition-opacity"
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
      </div>
    </div>
  )
}
