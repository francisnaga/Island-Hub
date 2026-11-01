import Link from 'next/link'
import { Ban, PauseCircle, MapPin } from 'lucide-react'
import { Vendor } from '@/lib/types'
import { cn } from '@/lib/utils'
import { WavyAvatar } from '@/components/brand/WavyAvatar'
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

  return (
    <Link
      href={`/vendors/${vendor.slug || vendor.id}`}
      className={cn(
        'group relative block rounded-2xl border p-6 sm:p-7 transition-all bg-card shadow-2xs hover:border-foreground/30 hover:shadow-xs text-center cursor-pointer',
        isBanned
          ? 'border-red-500/30 bg-red-950/10'
          : 'border-border/80'
      )}
    >
      {/* Top-Right Twitter/Facebook Style Verified Badge */}
      {isVerified && !isBanned && (
        <div
          className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center justify-center shrink-0"
          aria-label="Verified Vendor"
          title="Verified Vendor"
        >
          <VerifiedBadge size={22} />
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

      {/* Center: 88px Circular Avatar */}
      <div className="flex justify-center">
        <div className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden bg-muted ring-2 ring-border/70 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
          {vendor.logo_url ? (
            <img
              src={vendor.logo_url}
              alt={vendor.shop_name}
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

      {/* Name, Role & Campus */}
      <div className="mt-4 space-y-1">
        <h3 className="font-[family-name:var(--font-bricolage)] font-semibold text-lg sm:text-xl text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors inline-flex items-center justify-center gap-1.5">
          <span>{vendor.shop_name}</span>
          {isVerified && !isBanned && <VerifiedBadge size={17} />}
        </h3>
        <p className="text-xs text-muted-foreground font-medium">
          {roleLabel}
        </p>
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-0.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{campusLabel}</span>
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="my-4 border-t border-border/60" />

      {/* Bottom Center: Prototype Listings Count (Zero fake ratings) */}
      <div className="text-center">
        <span
          className={cn(
            'text-sm',
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
