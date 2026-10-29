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
    shop: 'Physical Shop',
    pickup_point: 'Campus Pickup Point',
    home_based: 'Hostel / Home Seller',
    delivery_only: 'Delivery Only',
  }

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-[#0F6E6E]/40 hover:shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F2F2] border border-[#0F6E6E]/15 text-[#0F6E6E] font-bold text-base">
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={vendor.shop_name}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <Store className="h-5 w-5 text-[#0F6E6E]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/vendors/${vendor.slug || vendor.id}`}
                  className="text-base font-bold text-slate-900 hover:text-[#0F6E6E] transition-colors line-clamp-1"
                >
                  {vendor.shop_name}
                </Link>
                {vendor.verification_status === 'verified' && (
                  <BadgeCheck
                    className="h-4 w-4 text-[#0F6E6E] shrink-0"
                    aria-label="Verified Jetty Vendor"
                  />
                )}
              </div>
              <p className="text-xs text-slate-500">
                {vendor.department_or_business_info ||
                  (vendor.is_student ? 'NMU Student Vendor' : 'Okerenkoko Community Merchant')}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
            {locationTypeLabel[vendor.location_type] || 'Campus Seller'}
          </span>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {vendor.description}
        </p>

        {/* Location & Pickup summary */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
          {vendor.location_type === 'delivery_only' ? (
            <div className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-[#0F6E6E] shrink-0" />
              <span>Delivery Coverage: {vendor.delivery_coverage || 'NMU & Okerenkoko'}</span>
            </div>
          ) : vendor.location_visibility === 'hidden' ? (
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Pickup point shared on WhatsApp inquiry</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#0F6E6E] shrink-0" />
              <span className="truncate">{vendor.location_label || vendor.pickup_options}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={`/vendors/${vendor.slug || vendor.id}`}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0A4F4F] transition-colors"
        >
          View Storefront
        </Link>

        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Navigation className="h-3.5 w-3.5 text-[#0F6E6E]" />
            Directions
          </a>
        )}
      </div>
    </div>
  )
}
