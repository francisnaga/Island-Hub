import Link from 'next/link'
import { Ban, PauseCircle, MapPin } from 'lucide-react'
import { Vendor } from '@/lib/types'
import { cn } from '@/lib/utils'
import { WavyAvatar } from '@/components/brand/WavyAvatar'
import { UserAvatar } from '@/components/brand/UserAvatar'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'

interface VendorCardProps {
  vendor: Vendor
  listingsCount?: number
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

export function VendorCard({ vendor, listingsCount }: VendorCardProps) {
  const isBanned = vendor.verification_status === 'suspended'
  const isPaused = Boolean(vendor.is_paused) && !isBanned
  const isVerified = vendor.verification_status === 'verified'
  const roleLabel = getSellerTypeLabel(vendor)
  const campusLabel =
    vendor.campus === 'Both' ? 'Both campuses' : vendor.campus || 'Okerenkoko'
  const count = listingsCount ?? vendor.products_count ?? 0
  const vendorHref = vendor.username
    ? `/vendors/${vendor.username}`
    : `/vendors/${vendor.slug || vendor.id}`

  return (
    <Link
      href={vendorHref}
      className={cn(
        'group relative block rounded-2xl border p-4 sm:p-5 transition-all bg-card shadow-2xs hover:border-foreground/30 hover:shadow-xs text-center cursor-pointer overflow-hidden min-w-0',
        isBanned
          ? 'border-red-500/30 bg-red-950/10'
          : 'border-border/80'
      )}
    >
      {/* Top-Right Twitter/Facebook Style Verified Badge */}
      {isVerified && !isBanned && (
        <div
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 flex items-center justify-center shrink-0"
          aria-label="Verified Vendor"
          title="Verified Vendor"
        >
          <VerifiedBadge size={19} />
        </div>
      )}

      {/* Status Notice if Banned or Paused */}
      {isBanned && (
        <div className="mb-2 flex items-center justify-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
          <Ban className="h-3 w-3 shrink-0" />
          <span>BANNED</span>
        </div>
      )}

      {isPaused && (
        <div className="mb-2 flex items-center justify-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
          <PauseCircle className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-full">Away · {vendor.pause_reason || 'Paused'}</span>
        </div>
      )}

      {/* Center: Compact Circular Avatar */}
      <div className="flex justify-center">
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-full overflow-hidden bg-muted ring-2 ring-border/70 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
          <UserAvatar
            src={vendor.logo_url}
            seed={vendor.id || vendor.slug}
            name={vendor.shop_name}
            size={64}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* Name, Role & Campus */}
      <div className="mt-2.5 space-y-0.5 min-w-0 w-full overflow-hidden">
        <h3 className="font-[family-name:var(--font-bricolage)] font-semibold text-base sm:text-lg text-foreground leading-snug group-hover:text-primary transition-colors flex items-center justify-center gap-1.5 min-w-0 max-w-full">
          <span className="truncate min-w-0 max-w-full block">{vendor.shop_name}</span>
          {isVerified && !isBanned && <VerifiedBadge size={15} />}
        </h3>
        {vendor.username && (
          <p className="text-[11px] text-muted-foreground/70 font-medium truncate max-w-full">
            @{vendor.username}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground font-medium truncate max-w-full">
          {roleLabel}
        </p>
        <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground pt-0.5 min-w-0">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate max-w-[140px]">{campusLabel}</span>
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="my-2.5 border-t border-border/60" />

      {/* Bottom Center: Listings Count */}
      <div className="text-center">
        <span
          className={cn(
            'text-xs',
            count > 0
              ? 'font-semibold text-[#0F6E6E] dark:text-[#22D3EE]'
              : 'font-medium text-muted-foreground'
          )}
        >
          {count > 0 ? `${count} ${count === 1 ? 'listing' : 'listings'}` : 'No listings yet'}
        </span>
      </div>
    </Link>
  )
}
