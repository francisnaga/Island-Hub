import Link from 'next/link'
import {
  BadgeCheck,
  MapPin,
  Ban,
  Sparkles,
  Building2,
  PauseCircle,
  ArrowUpRight,
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
    return 'Independent seller'
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

export function VendorCard({ vendor }: VendorCardProps) {
  const isBanned = vendor.verification_status === 'suspended'
  const isPaused = Boolean(vendor.is_paused) && !isBanned

  const campusLabel =
    vendor.campus === 'Both'
      ? 'Okerenkoko & Kurutie'
      : vendor.campus || 'Okerenkoko'

  return (
    <Link
      href={`/vendors/${vendor.slug || vendor.id}`}
      className={cn(
        'group flex min-w-0 flex-col justify-between rounded-2xl border p-4 transition-all',
        isBanned
          ? 'border-red-500/40 bg-red-950/20 hover:border-red-500/70'
          : 'border-border bg-card hover:border-primary/60 hover:shadow-lg'
      )}
    >
      <div className="space-y-2.5 min-w-0">
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

        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-bold text-sm tracking-tight overflow-hidden',
              isBanned
                ? 'bg-red-950/60 border-red-500/40 text-red-300'
                : 'bg-accent border-primary/20 text-primary'
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
                  'text-sm font-bold truncate transition-colors',
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
              {!isBanned && vendor.is_featured && (
                <Sparkles className="h-3.5 w-3.5 text-[#E8B84A] shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 truncate">
              <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                {vendor.seller_type === 'business' && (
                  <Building2 className="h-3 w-3 text-primary" />
                )}
                {getSellerTypeLabel(vendor)}
              </span>
              <span>·</span>
              <span className="truncate">{campusLabel}</span>
            </div>
          </div>

          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
          {isBanned
            ? `Suspended: ${vendor.rejection_reason || 'Policy violation'}`
            : vendor.description}
        </p>
      </div>

      {!isBanned && vendor.location_label && vendor.location_visibility !== 'hidden' && (
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
          <MapPin className="h-3 w-3 text-primary shrink-0" />
          <span className="truncate">{vendor.location_label}</span>
        </div>
      )}
    </Link>
  )
}
