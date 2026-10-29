import Link from 'next/link'
import {
  BadgeCheck,
  Ban,
  Building2,
  PauseCircle,
  ArrowRight,
} from 'lucide-react'
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

export function VendorCard({ vendor }: VendorCardProps) {
  const isBanned = vendor.verification_status === 'suspended'
  const isPaused = Boolean(vendor.is_paused) && !isBanned

  const campusLabel =
    vendor.campus === 'Both'
      ? 'Okerenkoko & Kurutie'
      : vendor.campus || 'Okerenkoko'

  return (
    <div
      className={cn(
        'group flex min-w-0 flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all gap-3',
        isBanned
          ? 'border-red-500/30 bg-red-950/20'
          : 'border-border/80 bg-card hover:border-foreground/30 hover:shadow-xs'
      )}
    >
      <div className="space-y-3 min-w-0">
        {/* Status notice if Banned or Paused */}
        {isBanned && (
          <div className="flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">
            <Ban className="h-3.5 w-3.5 shrink-0" />
            <span>BANNED VENDOR</span>
          </div>
        )}

        {isPaused && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-500">
            <PauseCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Away · {vendor.pause_reason || 'Paused'}</span>
          </div>
        )}

        {/* Header Row: Matches Naga's card layout */}
        <div className="flex items-start sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar */}
            <div
              className={cn(
                'relative flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full border overflow-hidden shadow-2xs',
                isBanned
                  ? 'bg-red-950/60 border-red-500/40 text-red-300'
                  : 'border-border/70 bg-muted'
              )}
            >
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={vendor.shop_name}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    'h-full w-full object-cover',
                    isBanned && 'grayscale opacity-60'
                  )}
                />
              ) : (
                <WavyAvatar
                  name={vendor.shop_name}
                  seed={vendor.id || vendor.slug}
                  className={cn('h-full w-full', isBanned && 'grayscale opacity-60')}
                />
              )}
            </div>

            {/* Title & Metadata */}
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Link
                  href={`/vendors/${vendor.slug || vendor.id}`}
                  className={cn(
                    'text-sm sm:text-base font-bold line-clamp-1 transition-colors leading-snug hover:underline',
                    isBanned
                      ? 'text-red-400 line-through'
                      : 'text-foreground'
                  )}
                >
                  {vendor.shop_name}
                </Link>
                {/* Clean badge icon with NO glowing text container */}
                {!isBanned && vendor.verification_status === 'verified' && (
                  <BadgeCheck
                    className="h-4 w-4 text-primary shrink-0"
                    aria-label="Verified Vendor"
                  />
                )}
                {!isBanned && vendor.verification_status === 'pending' && (
                  <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                    (Pending)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80 flex items-center gap-1 shrink-0">
                  {vendor.seller_type === 'business' && (
                    <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  {getSellerTypeLabel(vendor)}
                </span>
                <span>·</span>
                <span className="truncate">{campusLabel}</span>
              </div>
            </div>
          </div>

          {/* Right Action Button (Desktop): Matching Naga's card button placement */}
          <Link
            href={`/vendors/${vendor.slug || vendor.id}`}
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted hover:border-foreground/40 transition-colors shrink-0"
          >
            <span>Storefront</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>

        {/* Short description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {vendor.description || 'Campus seller at NMU Okerenkoko & Kurutie.'}
        </p>
      </div>

      {/* Mobile-only action button */}
      <div className="sm:hidden pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
        <Link
          href={`/vendors/${vendor.slug || vendor.id}`}
          className="font-semibold text-foreground hover:underline flex items-center gap-1"
        >
          <span>Visit Storefront</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </Link>
      </div>
    </div>
  )
}
