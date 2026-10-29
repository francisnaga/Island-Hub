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
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-7xl px-4 space-y-8">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Vendor Storefronts
          </Link>

          <ReportListingModal
            targetType="vendor"
            vendorId={vendor.id}
            targetName={vendor.shop_name}
          />
        </div>

        {/* Storefront Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 max-w-3xl">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E6F2F2] border border-[#0F6E6E]/15 text-[#0F6E6E]">
                {vendor.logo_url ? (
                  <img
                    src={vendor.logo_url}
                    alt={vendor.shop_name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <Store className="h-8 w-8 text-[#0F6E6E]" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {vendor.shop_name}
                  </h1>
                  {vendor.verification_status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F2F2] border border-[#0F6E6E]/25 px-3 py-0.5 text-xs font-semibold text-[#0A4F4F]">
                      <BadgeCheck className="h-3.5 w-3.5 text-[#0F6E6E]" />
                      Verified Vendor
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      Pending Verification
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium text-slate-500">
                  {vendor.department_or_business_info ||
                    (vendor.is_student
                      ? 'NMU Student Seller'
                      : 'Local Okerenkoko Merchant')}
                </p>

                <p className="text-sm text-slate-700 leading-relaxed pt-1">
                  {vendor.description}
                </p>
              </div>
            </div>

            {/* Contact & Directions Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[230px]">
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <Navigation className="h-4 w-4 text-[#0F6E6E]" />
                  Get Directions (Google Maps)
                </a>
              )}
            </div>
          </div>

          {/* Pickup, Location & Verification Disclaimer Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 border-t border-slate-100 text-xs">
            <div className="rounded-xl bg-[#FAF9F6] border border-slate-200/80 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <MapPin className="h-3.5 w-3.5 text-[#0F6E6E]" />
                Pickup / Location
              </div>
              {vendor.location_type === 'delivery_only' ? (
                <p className="text-slate-600">
                  Delivery-only vendor ({vendor.delivery_coverage || 'NMU & Okerenkoko'})
                </p>
              ) : vendor.location_visibility === 'hidden' ? (
                <p className="text-slate-600">
                  Private hostel/home location · Message vendor on WhatsApp for meeting point
                </p>
              ) : (
                <p className="text-slate-600">
                  {vendor.location_label}
                  {vendor.location_visibility === 'approximate' &&
                    ' (General area — confirm exact spot on WhatsApp)'}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-[#FAF9F6] border border-slate-200/80 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Truck className="h-3.5 w-3.5 text-[#0F6E6E]" />
                Collection & Delivery Options
              </div>
              <p className="text-slate-600">
                {vendor.pickup_options || 'Contact seller for pickup times'}
                {vendor.delivery_available && vendor.delivery_coverage
                  ? ` · Delivers to ${vendor.delivery_coverage}`
                  : ''}
              </p>
            </div>

            <div className="rounded-xl bg-[#E6F2F2]/50 border border-[#0F6E6E]/25/70 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-950">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0F6E6E]" />
                Verification Notice
              </div>
              <p className="text-slate-600 leading-relaxed">
                A verified badge means Jetty checked this vendor&apos;s identity and contact details. Confirm availability and inspect items before paying.
              </p>
            </div>
          </div>
        </div>

        {/* Published Products Catalogue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Published Products ({products.length})
            </h2>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Package className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">
                No published products in this storefront yet
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                New listings appear here once approved by the marketplace review queue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
