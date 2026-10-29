import Link from 'next/link'
import Image from 'next/image'
import { BadgeCheck, Bed } from 'lucide-react'
import { LodgeListing } from '@/lib/lodge-data'

export function WaterlineRoomCard({
  lodge,
  selectedCampus = 'all',
}: {
  lodge: LodgeListing
  selectedCampus?: string
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
      href="/housing"
      className="card flex-none block w-[244px] snap-start text-left text-inherit no-underline group focus-visible:outline-2 focus-visible:outline-[#0F6E6E] rounded-[12px]"
    >
      {/* 16:10 Wide Aspect Image Container */}
      <div className="relative aspect-[16/10] w-full rounded-[12px] bg-[#D7E8E8] dark:bg-[#132A2A] overflow-hidden flex items-center justify-center text-[#0F6E6E] dark:text-[#E8B84A]">
        {lodge.image ? (
          <Image
            src={lodge.image}
            alt={lodge.title}
            fill
            sizes="244px"
            className="object-cover transition-transform group-hover:scale-105 duration-200"
          />
        ) : (
          <Bed className="w-9 h-9 opacity-45" />
        )}
        <span className="absolute left-2 top-2 h-[22px] px-2 rounded-full bg-white dark:bg-[#0B1414] text-[#0E1B1B] dark:text-[#E8F1F1] text-[11px] font-medium flex items-center shadow-xs">
          Room
        </span>
      </div>

      {/* Price + Period */}
      <div className="mt-2.5 font-semibold text-[16px] text-foreground tracking-tight flex items-baseline gap-1">
        <span>{priceNaira}</span>
        <span className="text-[12px] text-muted-foreground font-normal">
          / {lodge.period}
        </span>
      </div>

      {/* Title (2-Line Clamp) */}
      <div className="mt-0.5 text-[14px] text-foreground line-clamp-2 min-h-[2.8em] leading-snug">
        {lodge.title}
      </div>

      {/* Meta Row */}
      <div className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground whitespace-nowrap overflow-hidden">
        <BadgeCheck className="w-3.5 h-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
        <span>Verified</span>
        {!isSingleCampusSelected && (
          <span className="truncate">· {lodge.campus}</span>
        )}
      </div>
    </Link>
  )
}
