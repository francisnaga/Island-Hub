import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Briefcase, ChevronLeft, ChevronRight, MapPin, Navigation, ShoppingBag } from 'lucide-react'
import { ProductCard } from '@/components/cards/ProductCard'
import { getSellerTypeLabel, getVendorInitials } from '@/components/cards/VendorCard'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { ShareButton } from '@/components/shared/ShareButton'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { getPublicVendorBySlugOrId } from '@/lib/queries'
import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'
import {
  buildVendorStoreWhatsAppUrl,
  buildProductWhatsAppUrl,
  formatNaira,
  getCanonicalUrl,
} from '@/lib/whatsapp'
import { getServiceBySlug, inferServiceSlugFromProduct } from '@/lib/services-data'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { vendor } = await getPublicVendorBySlugOrId(slug)
  if (!vendor) return { title: 'Vendor Not Found | Jetty' }

  const canonicalPath = `/vendors/${vendor.slug || vendor.id}`
  const canonicalUrl = getCanonicalUrl(canonicalPath)
  const title = `${vendor.shop_name} | Jetty NMU`
  const description =
    vendor.description ||
    `Browse verified listings, products, kits and services from ${vendor.shop_name} at Nigeria Maritime University (${vendor.campus || 'Okerenkoko'}).`

  const previewImg =
    vendor.logo_url && !vendor.logo_url.startsWith('data:')
      ? vendor.logo_url
      : '/og-image.png'

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description,
      siteName: 'Jetty NMU',
      images: [
        {
          url: previewImg,
          width: 1200,
          height: 630,
          alt: vendor.shop_name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [previewImg],
    },
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

  const vendorPath = `/vendors/${vendor.slug || vendor.id}`
  const storeUrl = getCanonicalUrl(vendorPath)

  const whatsappStore = buildVendorStoreWhatsAppUrl({
    whatsappNumber: vendor.whatsapp_number,
    shopName: vendor.shop_name,
    storeUrl,
  })

  const hasPinnedGps =
    !isBanned &&
    vendor.latitude != null &&
    vendor.longitude != null &&
    Number.isFinite(Number(vendor.latitude)) &&
    Number.isFinite(Number(vendor.longitude))

  const directionsUrl = hasPinnedGps
    ? `https://www.google.com/maps/search/?api=1&query=${vendor.latitude},${vendor.longitude}`
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
      {/* 1. Deep Teal Top Header (.pb) matching Prototype — Stays #0A4F4F in both Light and Dark mode */}
      <section className="pb bg-[#0A4F4F] text-white">
        <div className="container mx-auto max-w-lg md:max-w-5xl flex items-center justify-between">
          <Link href="/marketplace?tab=stores" className="bk" aria-label="Back to stores">
            <ChevronLeft className="w-5 h-5 -ml-1 stroke-[2]" />
            <span>Back</span>
          </Link>
          <ShareButton
            path={vendorPath}
            title={vendor.shop_name}
            shareText={`Check out ${vendor.shop_name} on Jetty (${campusLabel}):`}
            className="text-white/80 hover:text-white transition-colors p-1.5 cursor-pointer"
            iconClassName="w-4.5 h-4.5"
          />
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

        {/* Name, Role & Campus (+ Optional Location if added) */}
        <h2 className="inline-flex items-center justify-center gap-1.5">
          <span>{vendor.shop_name}</span>
          {isVerified && <VerifiedBadge size={18} />}
        </h2>
        <div className="vk">{roleLabel}</div>
        <div className="vk2">
          <MapPin className="w-3.5 h-3.5" />
          <span>
            {campusLabel === 'Both' ? 'Both campuses' : campusLabel}
            {hasLocation ? ` · ${vendor.location_label}` : ''}
          </span>
        </div>

        {/* Verified Badge Pill (ONLY for verified vendors) */}
        {isVerified && (
          <div>
            <div className="vf">
              <VerifiedBadge size={14} />
              <span>Verified vendor</span>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-10 mt-4 pb-1.5">
          <div>
            <b className="block font-[family-name:var(--font-bricolage)] text-[22px] font-semibold leading-tight">
              {products.length}
            </b>
            <small className="text-[13px] text-white/80">
              {products.length === 1 ? 'Listing' : 'Listings'}
            </small>
          </div>
        </div>
      </section>

      <svg
        viewBox="0 0 432 28"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        className="block w-full h-7 -mt-[1px]"
      >
        <rect width="432" height="28" fill="#0A4F4F" />
        <path
          d="M0 14q27-14 54 0t54 0t54 0t54 0t54 0t54 0t54 0t54 0V28H0z"
          className="fill-background"
        />
        <path
          d="M0 14q27-14 54 0t54 0t54 0t54 0t54 0t54 0t54 0t54 0"
          fill="none"
          stroke="#E8B84A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* 2. Main Content Container */}
      <div className="container mx-auto max-w-lg md:max-w-5xl px-4 pt-4">
        {/* Primary CTA: Message on WhatsApp */}
        {whatsappStore.valid && !isBanned ? (
          <div className="md:max-w-md md:mx-auto">
            <a
              href={whatsappStore.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-2xl bg-[#0F6E6E] hover:bg-[#0A4F4F] dark:bg-[#14B8A6] dark:hover:bg-[#0F9E8E] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-3"
            >
              <WhatsAppIcon className="w-5 h-5 text-white" />
              <span>Message on WhatsApp</span>
            </a>
          </div>
        ) : null}

        {/* Location Section: Typed Location Explanation + Optional Pinned GPS Map Link */}
        {(hasLocation || directionsUrl) && (
          <div className="mt-4 p-4 rounded-2xl bg-card border border-border/80 text-xs flex items-start gap-3 text-muted-foreground shadow-2xs">
            <MapPin className="w-4 h-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              {hasLocation && (
                <div>
                  <b className="text-foreground">Pickup / Location: </b>
                  <span>{vendor.location_label}</span>
                </div>
              )}
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#0F6E6E] dark:text-[#22D3EE] hover:underline pt-0.5"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Open pinned location in Google Maps &rarr;</span>
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
              {serviceListings.map((s) => {
                const svcSlug = inferServiceSlugFromProduct(s)
                const matchedSvc = getServiceBySlug(svcSlug)
                const SvcIcon = (matchedSvc?.icon as any) || Briefcase
                const serviceWa = buildProductWhatsAppUrl({
                  whatsappNumber: vendor.whatsapp_number,
                  productTitle: s.title,
                  price: s.price,
                  productUrl: storeUrl,
                })

                return (
                  <a
                    key={s.id}
                    href={serviceWa.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-3 min-h-[52px] hover:opacity-90 transition-opacity group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#E6F2F2] dark:bg-[#132A2A] text-[#0F6E6E] dark:text-[#22D3EE] flex items-center justify-center shrink-0">
                        <SvcIcon className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <b className="text-[15px] font-semibold text-foreground truncate">{s.title}</b>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <span>From {formatNaira(s.price)}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* Active Storefront Product Listings (.grid) */}
        {regularListings.length > 0 && (
          <div className="mt-4">
            <h3 className="h3-proto">Listings</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {regularListings.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}

        {products.length === 0 && !isBanned && (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-8 text-center my-4">
            <ShoppingBag className="mx-auto h-7 w-7 text-muted-foreground/50 mb-2 stroke-[1.6]" />
            <p className="text-sm font-semibold text-foreground">
              No active listings
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This store hasn't posted any items yet.
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
