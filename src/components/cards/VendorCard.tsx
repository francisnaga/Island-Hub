import Link from 'next/link'
import {
  BadgeCheck,
  Ban,
  Sparkles,
  Building2,
  PauseCircle,
  ArrowRight,
} from 'lucide-react'
import { Vendor } from '@/lib/types'
import { cn } from '@/lib/utils'

interface VendorCardProps {
  vendor: Vendor
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

export function getVendorInitials(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return 'JT'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// Strict word limit helper to keep profile cards perfectly neat and uniform
function getShortOfferText(desc: string, maxWords = 9): string {
  if (!desc) return 'Campus seller at NMU'
  const clean = desc.trim().replace(/\s+/g, ' ')
  const words = clean.split(' ')
  if (words.length <= maxWords) return clean
  return words.slice(0, maxWords).join(' ') + '…'
}

export function VendorCard({ vendor }: VendorCardProps) {
  const isBanned = vendor.verification_status === 'suspended'
  const isPaused = Boolean(vendor.is_paused) && !isBanned

  const campusLabel =
    vendor.campus === 'Both'
      ? 'Okerenkoko & Kurutie'
      : vendor.campus || 'Okerenkoko'

  const shortOffer = getShortOfferText(vendor.description)

  return (
    <Link
      href={`/vendors/${vendor.slug || vendor.id}`}
      className={cn(
        'group flex min-w-0 flex-col justify-between rounded-2xl border p-4 sm:p-4.5 transition-all',
        isBanned
          ? 'border-red-500/30 bg-red-950/20 hover:border-red-500/50'
          : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
      )}
    >
      <div className="space-y-3 min-w-0">
        {/* Status Pills if Banned or Paused */}
        {isBanned && (
          <div className="flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">
            <Ban className="h-3.5 w-3.5 shrink-0" />
            <span>BANNED VENDOR</span>
          </div>
        )}

        {isPaused && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
            <PauseCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Away · {vendor.pause_reason || 'Paused'}</span>
          </div>
        )}

        {/* Social Profile Header */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border font-bold text-sm tracking-tight overflow-hidden',
              isBanned
                ? 'bg-red-950/60 border-red-500/40 text-red-300'
                : 'bg-muted border-border text-foreground'
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
              <span>{getVendorInitials(vendor.shop_name)}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 min-w-0">
              <h3
                className={cn(
                  'text-sm sm:text-base font-bold truncate transition-colors leading-snug',
                  isBanned
                    ? 'text-red-400 line-through'
                    : 'text-foreground group-hover:text-primary'
                )}
              >
                {vendor.shop_name}
              </h3>
              {!isBanned && vendor.verification_status === 'verified' && (
                <BadgeCheck
                  className="h-4 w-4 text-primary shrink-0"
                  aria-label="Verified Vendor"
                />
              )}
              {!isBanned && vendor.verification_status === 'pending' && (
                <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-semibold text-amber-500 shrink-0">
                  Pending
                </span>
              )}
              {!isBanned && vendor.is_featured && (
                <Sparkles className="h-3 w-3 text-[#E8B84A] shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 truncate">
              <span className="font-medium text-foreground/80 flex items-center gap-1">
                {vendor.seller_type === 'business' && (
                  <Building2 className="h-3 w-3 text-primary shrink-0" />
                )}
                {getSellerTypeLabel(vendor)}
              </span>
              <span>·</span>
              <span className="truncate">{campusLabel}</span>
            </div>
          </div>
        </div>

        {/* Strict Short Offer / Services Line */}
        <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
          {shortOffer}
        </p>
      </div>

      {/* Clean Bottom Action Row */}
      <div className="mt-3.5 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span className="text-[11px]">Tap to view storefront &amp; listings</span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </Link>
  )
}
