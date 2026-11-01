import Link from 'next/link'
import { Check, MapPin, Bed } from 'lucide-react'
import { LodgeListing } from '@/lib/lodge-data'

export function WaterlineRoomCard({
  lodge,
  selectedCampus = 'all',
  variant = 'rail',
}: {
  lodge: LodgeListing
  selectedCampus?: string
  variant?: 'rail' | 'grid'
}) {
  const isSingleCampusSelected =
    selectedCampus !== 'all' && selectedCampus !== ''

  const priceNaira = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(lodge.price)

  return (
    <Link
      href={`/housing/${lodge.id}`}
      className={
        variant === 'rail'
          ? 'card flex-none block w-[164px] sm:w-[180px] snap-start text-left text-inherit no-underline group focus-visible:outline-2 focus-visible:outline-[#0F6E6E] rounded-2xl'
          : 'card block w-full text-left text-inherit no-underline group focus-visible:outline-2 focus-visible:outline-[#0F6E6E] rounded-2xl'
      }
    >
      {/* 1:1 or 4:3 Soft Tinted Container matching Image 1 */}
      <div className="relative aspect-square w-full rounded-2xl bg-[#DCEBEB] dark:bg-[#132A2A] overflow-hidden flex items-center justify-center text-[#0F6E6E] dark:text-[#E8B84A]">
        {lodge.image ? (
          <img
            src={lodge.image}
            alt={lodge.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-200"
          />
        ) : (
          <Bed className="w-12 h-12 opacity-50 stroke-[1.5]" />
        )}
        <span className="absolute left-2.5 top-2.5 h-[22px] px-2.5 rounded-full bg-white dark:bg-[#0B1414] text-foreground text-[11px] font-semibold flex items-center shadow-xs">
          Room
        </span>
      </div>

      {/* Price + Period line matching Image 1 */}
      <div className="mt-2.5 font-bold text-[17px] text-foreground tracking-tight flex items-baseline gap-1">
        <span>{priceNaira}</span>
        <span className="text-[13px] text-muted-foreground font-normal">
          / {lodge.period}
        </span>
      </div>

      {/* Title line (2-Line Clamp) matching Image 1 */}
      <div className="mt-0.5 text-[14px] font-semibold text-foreground line-clamp-2 leading-snug">
        {lodge.title}
      </div>

      {/* Meta Row: ✓ Verified (only if verified) + Campus */}
      <div className="mt-1 flex items-center gap-2 text-[12px] text-muted-foreground whitespace-nowrap overflow-hidden">
        {lodge.is_verified && (
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            Verified
          </span>
        )}
        <span className="inline-flex items-center gap-0.5 truncate">
          <MapPin className="w-3 h-3 stroke-[2] shrink-0 text-muted-foreground" />
          {lodge.campus}
        </span>
      </div>
    </Link>
  )
}
