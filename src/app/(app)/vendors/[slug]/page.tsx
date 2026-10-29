import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BadgeCheck,
  Store,
  MapPin,
  Navigation,
  MessageCircle,
  Truck,
  ArrowLeft,
  Package,
  ShieldCheck,
} from 'lucide-react'
import { ProductCard } from '@/components/cards/ProductCard'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { getPublicVendorBySlugOrId } from '@/lib/queries'
import {
  buildGoogleMapsDirectionsUrl,
  buildVendorStoreWhatsAppUrl,
} from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export default async function VendorStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { vendor, products } = await getPublicVendorBySlugOrId(slug)

  if (!vendor) {
    notFound()
  }

  const whatsappStore = buildVendorStoreWhatsAppUrl({
    whatsappNumber: vendor.whatsapp_number,
    shopName: vendor.shop_name,
  })

  const directionsUrl = buildGoogleMapsDirectionsUrl({
    latitude: vendor.latitude,
    longitude: vendor.longitude,
    locationVisibility: vendor.location_visibility,
    locationType: vendor.location_type,
  })

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-6 sm:space-y-8 min-w-0">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Vendors
          </Link>

          <ReportListingModal
            targetType="vendor"
            vendorId={vendor.id}
            targetName={vendor.shop_name}
          />
        </div>

        {/* Storefront Header Card */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 space-y-5 shadow-2xs min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="flex items-start gap-3.5 sm:gap-4 max-w-3xl min-w-0">
              <div className="flex h-13 w-13 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/15 text-[#0F6E6E] dark:text-[#E8B84A]">
                {vendor.logo_url ? (
                  <img
                    src={vendor.logo_url}
                    alt={vendor.shop_name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <Store className="h-7 w-7 sm:h-8 sm:w-8" />
                )}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {vendor.shop_name}
                  </h1>
                  {vendor.verification_status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/25 px-2.5 py-0.5 text-xs font-semibold text-[#0A4F4F] dark:text-[#E8B84A]">
                      <BadgeCheck className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      Pending
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium text-muted-foreground">
                  {vendor.department_or_business_info ||
                    (vendor.is_student
                      ? 'NMU Student Seller'
                      : 'Local Okerenkoko Merchant')}
                </p>

                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pt-0.5">
                  {vendor.description}
                </p>
              </div>
            </div>

            {/* Contact & Directions Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 sm:min-w-[220px]">
              {whatsappStore.valid && (
                <a
                  href={whatsappStore.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-xs font-bold text-white hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message Store on WhatsApp
                </a>
              )}

              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Navigation className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A]" />
                  Get Directions (Google Maps)
                </a>
              )}
            </div>
          </div>

          {/* Pickup, Location & Verification Disclaimer Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-border text-xs">
            <div className="rounded-xl bg-muted/50 border border-border p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <MapPin className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                Pickup / Location
              </div>
              {vendor.location_type === 'delivery_only' ? (
                <p className="text-muted-foreground">
                  Delivery-only vendor ({vendor.delivery_coverage || 'NMU & Okerenkoko'})
                </p>
              ) : vendor.location_visibility === 'hidden' ? (
                <p className="text-muted-foreground">
                  Private hostel/home location · Message vendor on WhatsApp for meeting point
                </p>
              ) : (
                <p className="text-muted-foreground">
                  {vendor.location_label}
                  {vendor.location_visibility === 'approximate' &&
                    ' (General area — confirm exact spot on WhatsApp)'}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-muted/50 border border-border p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Truck className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                Collection &amp; Delivery
              </div>
              <p className="text-muted-foreground">
                {vendor.pickup_options || 'Contact seller for pickup times'}
                {vendor.delivery_available && vendor.delivery_coverage
                  ? ` · Delivers to ${vendor.delivery_coverage}`
                  : ''}
              </p>
            </div>

            <div className="rounded-xl bg-[#E6F2F2]/50 dark:bg-[#132A2A]/60 border border-[#0F6E6E]/25 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                Verification Notice
              </div>
              <p className="text-muted-foreground leading-relaxed">
                A verified badge means Jetty checked this vendor&apos;s identity and contact details. Confirm availability before paying.
              </p>
            </div>
          </div>
        </div>

        {/* Published Products Catalogue (2 cols on mobile) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-bold text-foreground">
              Published Products ({products.length})
            </h2>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-sm font-bold text-foreground">
                No published products in this storefront yet
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                New listings appear here once approved by the marketplace review queue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
