import Link from 'next/link'
import { MapPin, Bed } from 'lucide-react'
import { LodgeListing } from '@/lib/lodge-data'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { UserAvatar } from '@/components/brand/UserAvatar'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

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
          ? 'card flex-none block w-[230px] sm:w-[260px] snap-start text-left text-inherit no-underline group focus-visible:outline-2 focus-visible:outline-[#0F6E6E] rounded-2xl sm:rounded-3xl'
          : 'card block w-full text-left text-inherit no-underline group focus-visible:outline-2 focus-visible:outline-[#0F6E6E] rounded-2xl sm:rounded-3xl'
      }
    >
      {/* 16:10 Soft Tinted Container matching Prototype */}
      <div className="relative aspect-[16/10] w-full rounded-2xl sm:rounded-3xl bg-[#DCEBEB] dark:bg-[#132A2A] overflow-hidden flex items-center justify-center text-[#0F6E6E] dark:text-[#E8B84A] border border-border/80">
        {lodge.image ? (
          <OptimizedImage
            src={lodge.image}
            alt={lodge.title}
            sizes={
              variant === 'rail'
                ? '260px'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px'
            }
            className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-200"
            fallback={<Bed className="w-12 h-12 opacity-50 stroke-[1.5]" />}
          />
        ) : (
          <Bed className="w-12 h-12 opacity-50 stroke-[1.5]" />
        )}
        <span className="absolute left-2.5 top-2.5 h-[22px] px-2.5 rounded-full bg-white/95 dark:bg-[#0B1414]/95 backdrop-blur-xs text-foreground text-[11px] font-semibold flex items-center shadow-xs border border-black/5 dark:border-white/10">
          {lodge.room_type_label || 'Room'}
        </span>
      </div>

      {/* Price + Period line */}
      <div className="mt-2.5 font-bold text-[18px] sm:text-[20px] text-foreground tracking-tight flex items-baseline gap-1 tabular-nums">
        <span>{priceNaira}</span>
        <span className="text-[13px] text-muted-foreground font-normal">
          / {lodge.period}
        </span>
      </div>

      {/* Title line (1-Line Clamp) */}
      <div className="mt-0.5 text-[14px] sm:text-[15px] font-semibold text-foreground line-clamp-1 leading-snug group-hover:text-[#0F6E6E] dark:group-hover:text-[#22D3EE] transition-colors">
        {lodge.title}
      </div>

      {/* Location line */}
      <div className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground truncate">
        <MapPin className="w-3 h-3 stroke-[2] shrink-0 text-muted-foreground" />
        <span className="truncate">
          {lodge.campus}
          {lodge.location_label
            ? ` · ${lodge.location_label}`
            : lodge.distance_hint
            ? ` · ${lodge.distance_hint}`
            : ''}
        </span>
      </div>

      {/* Seller / Caretaker Row: Avatar + Name + Verified Badge */}
      <div className="mt-1.5 flex items-center justify-between gap-1.5 pt-1.5 border-t border-border/60 text-[11px] text-muted-foreground min-w-0 overflow-hidden">
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <UserAvatar
            src={lodge.contact_avatar}
            seed={lodge.vendor_slug || lodge.contact_name}
            name={lodge.contact_name}
            size={16}
            className="w-4 h-4 shrink-0 border border-border/80 shadow-2xs"
          />
          <span className="truncate font-medium text-foreground/80 min-w-0 block">
            {lodge.contact_name}
          </span>
          {lodge.is_verified && <VerifiedBadge size={13} />}
        </div>
        {!isSingleCampusSelected && (
          <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">
            {lodge.campus}
          </span>
        )}
      </div>
    </Link>
  )
}
