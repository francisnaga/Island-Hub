import Link from 'next/link'
import {
  BadgeCheck,
  MapPin,
  Truck,
  Navigation,
  Clock,
  Ban,
  Sparkles,
  Building2,
  PauseCircle,
} from 'lucide-react'
import { Vendor } from '@/lib/types'
import { buildGoogleMapsDirectionsUrl, daysSinceConfirmed } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

interface VendorCardProps {
  vendor: Vendor
}

export function getSellerTypeLabel(vendor: Vendor): string {
  if (vendor.seller_type === 'business') {
    return vendor.business_verified ? 'Verified business' : 'Business storefront'
  }
  if (vendor.seller_type === 'independent') {
    return 'Independent seller'
  }
  if (vendor.seller_type === 'student' || vendor.is_student) {
    return 'Student seller'
  }
  return 'Independent seller'
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

  const directionsUrl = isBanned
    ? null
    : buildGoogleMapsDirectionsUrl({
        latitude: vendor.latitude,
        longitude: vendor.longitude,
        locationVisibility: vendor.location_visibility,
        locationType: vendor.location_type,
      })

  const confirmedDays = daysSinceConfirmed(
    vendor.location_confirmed_at || vendor.created_at
  )

  const campusLabel =
    vendor.campus === 'Both'
      ? 'Okerenkoko & Kurutie'
      : vendor.campus || 'Okerenkoko'

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col justify-between rounded-xl border p-4 sm:p-5 transition-all',
        isBanned
          ? 'border-red-300 bg-red-50/40 dark:border-red-900/70 dark:bg-red-950/20'
          : 'border-border bg-card hover:border-[#0F6E6E]/40 hover:shadow-sm'
      )}
    >
      <div className="space-y-3 min-w-0">
        {/* Banned Warning Banner if searched */}
        {isBanned && (
          <div className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white">
            <Ban className="h-4 w-4 shrink-0" />
            <span>BANNED VENDOR · Storefront &amp; listings archived</span>
          </div>
        )}

        {/* Paused Banner if vendor paused shop */}
        {isPaused && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2.5 py-1 text-[11px] font-semibold text-amber-950 dark:text-amber-200">
            <PauseCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Temporarily unavailable ({vendor.pause_reason || 'Paused'})</span>
          </div>
        )}

        {/* Vendor Identity Header */}
        <div className="flex items-start justify-between gap-2.5 min-w-0">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                'flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border font-bold text-sm tracking-tight mt-0.5 overflow-hidden',
                isBanned
                  ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : 'bg-[#E6F2F2] dark:bg-[#132A2A] border-[#0F6E6E]/20 text-[#0F6E6E] dark:text-[#E8B84A]'
              )}
            >
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={`${vendor.shop_name} avatar`}
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

            <div className="min-w-0 space-y-1">
              <div className="flex items-start gap-1.5 min-w-0">
                <Link
                  href={`/vendors/${vendor.slug || vendor.id}`}
                  className={cn(
                    'text-sm sm:text-base font-bold transition-colors leading-snug line-clamp-2',
                    isBanned
                      ? 'text-red-900 dark:text-red-300 line-through'
                      : 'text-foreground hover:text-[#0F6E6E] dark:hover:text-[#E8B84A]'
                  )}
                >
                  {vendor.shop_name}
                </Link>
                {!isBanned && vendor.verification_status === 'verified' && (
                  <BadgeCheck
                    className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5"
                    aria-label="Verified Jetty Vendor"
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                  {vendor.seller_type === 'business' && (
                    <Building2 className="h-3 w-3 text-[#0F6E6E] dark:text-[#E8B84A]" />
                  )}
                  {getSellerTypeLabel(vendor)}
                </span>

                <span className="inline-flex items-center rounded-md bg-muted/70 px-2 py-0.5 text-[11px] text-muted-foreground">
                  {campusLabel}
                </span>

                {!isBanned && vendor.is_featured && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#E8B84A]/20 border border-[#E8B84A]/50 px-2 py-0.5 text-[10px] font-bold text-foreground">
                    <Sparkles className="h-2.5 w-2.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {isBanned
            ? `This vendor storefront has been suspended by Jetty Moderation. Reason: ${
                vendor.rejection_reason || 'Marketplace policy violation.'
              }`
            : vendor.description}
        </p>

        {/* Campus, Pickup Landmark & Availability Details */}
        {!isBanned && (
          <div className="space-y-1.5 pt-2.5 border-t border-border/60 text-xs text-muted-foreground min-w-0">
            {vendor.location_type === 'delivery_only' ? (
              <div className="flex items-start gap-1.5 min-w-0">
                <Truck className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Delivery only:</strong>{' '}
                  {vendor.delivery_coverage || campusLabel}
                </span>
              </div>
            ) : vendor.location_visibility === 'hidden' ? (
              <div className="flex items-start gap-1.5 min-w-0">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Pickup:</strong> Landmark shared on WhatsApp
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 min-w-0">
                <MapPin className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  <strong className="text-foreground">Landmark:</strong>{' '}
                  {vendor.location_label || vendor.pickup_options}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                {confirmedDays === 0
                  ? 'Active today'
                  : `Confirmed ${confirmedDays}d ago`}
              </span>
              {vendor.opening_hours && (
                <span className="truncate max-w-[160px]">{vendor.opening_hours}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <Link
          href={`/vendors/${vendor.slug || vendor.id}`}
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-lg px-3.5 text-xs font-semibold transition-colors',
            isBanned
              ? 'border border-red-300 bg-white text-red-800 hover:bg-red-50 dark:bg-red-950/50 dark:text-red-200'
              : 'bg-[#0F6E6E] text-white hover:bg-[#0A4F4F]'
          )}
        >
          {isBanned ? 'View Banned Status' : 'View Storefront →'}
        </Link>

        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Get Google Maps directions to ${vendor.shop_name}`}
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Navigation className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
            Directions
          </a>
        )}
      </div>
    </div>
  )
}
