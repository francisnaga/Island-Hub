import Link from 'next/link'
import { BadgeCheck, MapPin, Store, Truck, Navigation, Clock } from 'lucide-react'
import { Vendor } from '@/lib/types'
import { buildGoogleMapsDirectionsUrl, daysSinceConfirmed } from '@/lib/whatsapp'

interface VendorCardProps {
  vendor: Vendor
}

function getVendorSellerDistinction(vendor: Vendor): string {
  if (vendor.location_type === 'delivery_only') return 'Delivery only'
  if (vendor.location_type === 'pickup_point') return 'Campus pickup'
  if (vendor.location_type === 'home_based') return 'Student seller'
  if (vendor.location_type === 'shop') {
    return vendor.is_student ? 'Student seller · Physical shop' : 'Physical shop'
  }
  return vendor.is_student ? 'Student seller' : 'Local merchant'
}

export function VendorCard({ vendor }: VendorCardProps) {
  const directionsUrl = buildGoogleMapsDirectionsUrl({
    latitude: vendor.latitude,
    longitude: vendor.longitude,
    locationVisibility: vendor.location_visibility,
    locationType: vendor.location_type,
  })

  const confirmedDays = daysSinceConfirmed(
    vendor.location_confirmed_at || vendor.created_at
  )

  return (
    <div className="flex min-w-0 flex-col justify-between rounded-xl border border-border bg-card p-4 sm:p-5 transition-all hover:border-[#0F6E6E]/40 hover:shadow-sm">
      <div className="space-y-3 min-w-0">
        {/* Vendor Identity Header (Full readable name, not single-line truncated) */}
        <div className="flex items-start justify-between gap-2.5 min-w-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/15 text-[#0F6E6E] dark:text-[#E8B84A] font-bold text-base mt-0.5">
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={`${vendor.shop_name} logo`}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <Store className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-start gap-1.5 min-w-0">
                <Link
                  href={`/vendors/${vendor.slug || vendor.id}`}
                  className="text-sm sm:text-base font-bold text-foreground hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors leading-snug line-clamp-2"
                >
                  {vendor.shop_name}
                </Link>
                {vendor.verification_status === 'verified' && (
                  <BadgeCheck
                    className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5"
                    aria-label="Verified Jetty Vendor"
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                  {getVendorSellerDistinction(vendor)}
                </span>
                {vendor.verification_status === 'verified' && (
                  <span className="text-[11px] font-medium text-[#0F6E6E] dark:text-[#E8B84A]">
                    Identity &amp; WhatsApp checked
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {vendor.description}
        </p>

        {/* Distinct Campus, Pickup Landmark & Delivery Availability Details */}
        <div className="space-y-1.5 pt-2.5 border-t border-border/60 text-xs text-muted-foreground min-w-0">
          {vendor.location_type === 'delivery_only' ? (
            <div className="flex items-start gap-1.5 min-w-0">
              <Truck className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Delivery only:</strong>{' '}
                {vendor.delivery_coverage || 'NMU & Okerenkoko'}
              </span>
            </div>
          ) : vendor.location_visibility === 'hidden' ? (
            <div className="flex items-start gap-1.5 min-w-0">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Pickup:</strong> Landmark shared privately on WhatsApp
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

          {vendor.location_type !== 'delivery_only' && (
            <div className="flex items-start gap-1.5 min-w-0">
              <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <span className="leading-snug">
                <strong className="text-foreground">Delivery:</strong>{' '}
                {vendor.delivery_available
                  ? vendor.delivery_coverage || 'Available across NMU hostels'
                  : 'Campus pickup only'}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
            <Clock className="h-3 w-3 shrink-0" />
            <span>
              {confirmedDays === 0
                ? 'Store details confirmed today'
                : `Store details confirmed ${confirmedDays}d ago`}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <Link
          href={`/vendors/${vendor.slug || vendor.id}`}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0F6E6E] px-3.5 text-xs font-semibold text-white hover:bg-[#0A4F4F] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E]"
        >
          View Storefront
        </Link>

        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Get Google Maps directions to ${vendor.shop_name}`}
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E]"
          >
            <Navigation className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
            Directions
          </a>
        )}
      </div>
    </div>
  )
}
