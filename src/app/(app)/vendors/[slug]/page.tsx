import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight, MapPin, Share2, Navigation } from 'lucide-react'
import { ProductCard } from '@/components/cards/ProductCard'
import { getSellerTypeLabel, getVendorInitials } from '@/components/cards/VendorCard'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { getPublicVendorBySlugOrId } from '@/lib/queries'
import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'
import { buildGoogleMapsDirectionsUrl, buildVendorStoreWhatsAppUrl, formatNaira } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { vendor } = await getPublicVendorBySlugOrId(slug)
  if (!vendor) return { title: 'Vendor Not Found | Jetty' }

  return {
    title: `${vendor.shop_name} | Jetty NMU`,
    description: vendor.description,
  }
}

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

  const isBanned = vendor.verification_status === 'suspended'
  const isVerified = vendor.verification_status === 'verified' && !isBanned

  const whatsappStore = buildVendorStoreWhatsAppUrl({
    whatsappNumber: vendor.whatsapp_number,
    shopName: vendor.shop_name,
  })

  const directionsUrl =
    !isBanned && vendor.location_visibility === 'exact'
      ? buildGoogleMapsDirectionsUrl({
          latitude: vendor.latitude,
          longitude: vendor.longitude,
          locationVisibility: vendor.location_visibility,
          locationType: vendor.location_type,
        })
      : null

  const campusLabel = vendor.campus || 'Okerenkoko'
  const roleLabel = getSellerTypeLabel(vendor)
  const initials = getVendorInitials(vendor.shop_name)

  // Separate service listings from physical/food/room listings
  const serviceListings = products.filter((p) => p.listing_type === 'service')
  const regularListings = products.filter((p) => p.listing_type !== 'service')

  const hasLocation = Boolean(
    vendor.location_label &&
      vendor.location_visibility !== 'hidden' &&
      vendor.location_label.trim().length > 0
  )

  return (
    <div className="min-w-0 max-w-full pb-24">
      {/* 1. Deep Teal Top Header (.pb) matching Prototype */}
      <section className="pb">
        <div className="container mx-auto max-w-lg flex items-center justify-between">
          <Link href="/marketplace?tab=stores" className="bk" aria-label="Back to stores">
            <ChevronLeft className="w-5 h-5 -ml-1 stroke-[2]" />
            <span>Back</span>
          </Link>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Check out ${vendor.shop_name} on Jetty (${campusLabel}) — https://jetty.francisnaga.site/vendors/${vendor.slug || vendor.id}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share Storefront"
            className="text-white/80 hover:text-white transition-colors"
          >
            <Share2 className="w-4.5 h-4.5" />
          </a>
        </div>

        {/* 88px Circular Avatar with Ring (.av) */}
        <div className="av">
          {vendor.logo_url ? (
            <img
              src={vendor.logo_url}
              alt={vendor.shop_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Name, Role & Campus */}
        <h2>{vendor.shop_name}</h2>
        <div className="vk">{roleLabel}</div>
        <div className="vk2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{campusLabel}</span>
        </div>

        {/* Verified Badge Pill */}
        {isVerified && (
          <div>
            <div className="vf">
              <svg
                className="w-3.5 h-3.5 fill-none stroke-current"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>Verified vendor</span>
            </div>
          </div>
        )}
      </section>

      {/* 2. Main Content Container */}
      <div className="container mx-auto max-w-lg px-4 pt-4">
        {/* Primary CTA: Message on WhatsApp */}
        {whatsappStore.valid && !isBanned ? (
          <a
            href={whatsappStore.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn cursor-pointer"
          >
            <WhatsAppIcon className="w-5 h-5 text-white" />
            <span>Message on WhatsApp</span>
          </a>
        ) : null}

        {/* Location Section: ONLY SHOWN IF VENDOR ADDED ONE */}
        {hasLocation && (
          <div className="mt-4 p-3.5 rounded-[14px] bg-card border border-border/80 text-xs flex items-start gap-2.5 text-muted-foreground shadow-2xs">
            <MapPin className="w-4 h-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div>
                <b className="text-foreground">Pickup Location: </b>
                <span>{vendor.location_label}</span>
              </div>
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline pt-0.5"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Get directions on Google Maps &rarr;</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* About Vendor Description (.about-p) */}
        {vendor.description && (
          <p className="about-p">{vendor.description}</p>
        )}

        {/* Services Offered by Vendor (if any) */}
        {serviceListings.length > 0 && (
          <div className="mt-4">
            <h3 className="h3-proto">Services</h3>
            <div className="border-t border-[#DCE8E8] dark:border-border divide-y divide-[#DCE8E8] dark:divide-border">
              {serviceListings.map((s) => (
                <Link
                  key={s.id}
                  href={`/products/${s.slug || s.id}`}
                  className="flex items-center justify-between py-3 min-h-[52px] hover:opacity-90 transition-opacity group"
                >
                  <b className="text-[15px] font-semibold text-foreground">{s.title}</b>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>From {formatNaira(s.price)}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Active Storefront Product Listings (.grid) */}
        {regularListings.length > 0 && (
          <div className="mt-4">
            <h3 className="h3-proto">Listings</h3>
            <div className="grid grid-cols-2 gap-3">
              {regularListings.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}

        {products.length === 0 && !isBanned && (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-6 text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">No active listings right now</p>
            <p className="text-xs text-muted-foreground">
              Message {vendor.shop_name} directly on WhatsApp to ask about current availability.
            </p>
          </div>
        )}

        {/* Quiet Report Link */}
        <div className="pt-4 text-center">
          <ReportListingModal
            targetType="vendor"
            vendorId={vendor.id}
            targetName={vendor.shop_name}
          />
        </div>
      </div>
    </div>
  )
}
