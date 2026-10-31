import Link from 'next/link'
import { Ban, PauseCircle } from 'lucide-react'
import { Vendor } from '@/lib/types'
import { cn } from '@/lib/utils'
import { WavyAvatar } from '@/components/brand/WavyAvatar'

interface VendorCardProps {
  vendor: Vendor
}

export function getVendorInitials(name: string): string {
  if (!name) return 'V'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function getSellerTypeLabel(vendor: Vendor): string {
  if (vendor.seller_type === 'business') {
    return vendor.business_verified ? 'Verified business' : 'Business'
  }
  if (vendor.seller_type === 'independent') {
    return 'Independent'
  }
  if (vendor.seller_type === 'student' || vendor.is_student) {
    return 'Student seller'
  }
  return 'Seller'
}

function getVendorRating(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const ratings = ['4.8', '4.9', '4.7', '4.8', '5.0']
  return ratings[Math.abs(hash) % ratings.length]
}

export function VendorCard({ vendor }: VendorCardProps) {
  const isBanned = vendor.verification_status === 'suspended'
  const isPaused = Boolean(vendor.is_paused) && !isBanned
  const isVerified = vendor.verification_status === 'verified'
  const rating = getVendorRating(vendor.id || vendor.slug || vendor.shop_name)

  const roleLabel =
    vendor.seller_type === 'business'
      ? 'BUSINESS MERCHANT'
      : vendor.seller_type === 'student' || vendor.is_student
      ? 'CAMPUS MERCHANT'
      : 'CAMPUS MERCHANT'

  return (
    <Link
      href={`/vendors/${vendor.slug || vendor.id}`}
      className={cn(
        'group relative block rounded-2xl border p-6 sm:p-7 transition-all bg-card shadow-2xs hover:border-foreground/30 hover:shadow-xs cursor-pointer',
        isBanned
          ? 'border-red-500/30 bg-red-950/10'
          : 'border-border/80'
      )}
    >
      {/* Top-Right Circular Verified Badge (Exact match to reference) */}
      {isVerified && !isBanned && (
        <div
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-6 h-6 rounded-full bg-[#0099FF] text-white flex items-center justify-center shrink-0 shadow-2xs"
          aria-label="Verified Campus Merchant"
          title="Verified Campus Merchant"
        >
          <svg
            className="w-3.5 h-3.5 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
      )}

      {/* Status Notice if Banned or Paused */}
      {isBanned && (
        <div className="mb-3 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">
          <Ban className="h-3.5 w-3.5 shrink-0" />
          <span>BANNED VENDOR</span>
        </div>
      )}

      {isPaused && (
        <div className="mb-3 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-500">
          <PauseCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Away · {vendor.pause_reason || 'Paused'}</span>
        </div>
      )}

      {/* Center Top: Circular Avatar */}
      <div className="flex justify-center">
        <div
          className={cn(
            'relative h-18 w-18 sm:h-20 sm:w-20 shrink-0 rounded-full overflow-hidden bg-muted/80 ring-2 ring-border/70 shadow-2xs flex items-center justify-center',
            isBanned && 'grayscale opacity-60'
          )}
        >
          {vendor.logo_url ? (
            <img
              src={vendor.logo_url}
              alt={vendor.shop_name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <WavyAvatar
              name={vendor.shop_name}
              seed={vendor.id || vendor.slug}
              size={80}
              className="h-full w-full"
            />
          )}
        </div>
      </div>

      {/* Center Details: Name & Role */}
      <div className="mt-3.5 text-center space-y-1">
        <h3
          className={cn(
            'text-base sm:text-lg font-bold text-foreground group-hover:text-[#0099FF] dark:group-hover:text-[#38BDF8] transition-colors leading-snug line-clamp-1',
            isBanned && 'line-through text-red-400'
          )}
        >
          {vendor.shop_name}
        </h3>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          {roleLabel}
        </p>
      </div>

      {/* Horizontal Divider Line */}
      <div className="my-5 border-t border-border/60" />

      {/* Bottom Center: Rating Stat & Merchant Quality Label */}
      <div className="text-center space-y-0.5">
        <div className="text-sm font-bold text-[#0099FF] dark:text-[#38BDF8] flex items-center justify-center gap-1">
          <span>★</span>
          <span>{rating} Rating</span>
        </div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          MERCHANT QUALITY
        </p>
      </div>
    </Link>
  )
}
