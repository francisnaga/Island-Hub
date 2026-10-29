import Link from 'next/link'
import { BadgeCheck, MapPin, Store, Truck, Navigation } from 'lucide-react'
import { Vendor } from '@/lib/types'
import { buildGoogleMapsDirectionsUrl } from '@/lib/whatsapp'

interface VendorCardProps {
  vendor: Vendor
}

export function VendorCard({ vendor }: VendorCardProps) {
  const directionsUrl = buildGoogleMapsDirectionsUrl({
    latitude: vendor.latitude,
    longitude: vendor.longitude,
    locationVisibility: vendor.location_visibility,
    locationType: vendor.location_type,
  })

  const locationTypeLabel: Record<Vendor['location_type'], string> = {
    shop: 'Shop',
    pickup_point: 'Pickup Point',
    home_based: 'Hostel Seller',
    delivery_only: 'Delivery Only',
  }

  return (
    <div className="flex min-w-0 flex-col justify-between rounded-xl border border-border bg-card p-4 sm:p-5 transition-all hover:border-[#0F6E6E]/40 hover:shadow-sm">
      <div className="space-y-3 min-w-0">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/15 text-[#0F6E6E] dark:text-[#E8B84A] font-bold text-base">
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={vendor.shop_name}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <Store className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <Link
                  href={`/vendors/${vendor.slug || vendor.id}`}
                  className="text-sm sm:text-base font-bold text-foreground hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors truncate"
                >
                  {vendor.shop_name}
                </Link>
                {vendor.verification_status === 'verified' && (
                  <BadgeCheck
                    className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0"
                    aria-label="Verified Jetty Vendor"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {vendor.department_or_business_info ||
                  (vendor.is_student ? 'NMU Student Vendor' : 'Okerenkoko Merchant')}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {locationTypeLabel[vendor.location_type] || 'Seller'}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {vendor.description}
        </p>

        {/* Location & Pickup summary */}
        <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs text-muted-foreground min-w-0">
          {vendor.location_type === 'delivery_only' ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <Truck className="h-3.5 w-3.5 text-[#0F6E6E] shrink-0" />
              <span className="truncate">Delivers: {vendor.delivery_coverage || 'NMU & Okerenkoko'}</span>
            </div>
          ) : vendor.location_visibility === 'hidden' ? (
            <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Pickup point shared on WhatsApp</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
              <span className="truncate">{vendor.location_label || vendor.pickup_options}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <Link
          href={`/vendors/${vendor.slug || vendor.id}`}
          className="inline-flex items-center justify-center rounded-lg bg-[#0F6E6E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0A4F4F] transition-colors"
        >
          View Storefront
        </Link>

        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Navigation className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
            Directions
          </a>
        )}
      </div>
    </div>
  )
}
