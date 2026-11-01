import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { WaterlineProductCard } from '@/components/cards/WaterlineProductCard'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { getVendorInitials } from '@/components/cards/VendorCard'
import { ShareButton } from '@/components/shared/ShareButton'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import {
  getPublicProductBySlugOrId,
  getPublicProducts,
} from '@/lib/queries'
import {
  formatNaira,
  buildProductWhatsAppUrl,
  daysSinceConfirmed,
  getCanonicalUrl,
} from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'

export const dynamic = 'force-dynamic'

const conditionLabels: Record<string, string> = {
  new: 'Brand New',
  like_new: 'Like New',
  good: 'Good (Pre-owned)',
  fair: 'Fair Condition',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getPublicProductBySlugOrId(slug)
  if (!product) {
    return { title: 'Item Not Found | Jetty' }
  }

  const canonicalPath = `/product/${product.slug || product.id}`
  const canonicalUrl = getCanonicalUrl(canonicalPath)
  const title = `${product.title} — ${formatNaira(product.price)} | Jetty NMU`

  return {
    title,
    description: product.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description: product.description,
      url: canonicalUrl,
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getPublicProductBySlugOrId(slug)

  if (!product) {
    notFound()
  }

  const vendor = product.vendor
  const primaryMedia =
    product.images?.[0] || '/products/cadet-action-rig-navy.jpg'

  // Fetch more from this vendor
  const { products: vendorProducts } = await getPublicProducts({
    limit: 6,
  })
  const moreFromVendor = vendorProducts
    .filter((p) => p.vendor_id === product.vendor_id && p.id !== product.id)
    .slice(0, 4)

  const daysConfirmed = daysSinceConfirmed(product.last_confirmed_at)
  const isVerifiedVendor = vendor?.verification_status === 'verified'
  const vendorInitials = vendor ? getVendorInitials(vendor.shop_name) : 'V'

  const productPath = `/product/${product.slug || product.id}`
  const productUrl = getCanonicalUrl(productPath)

  const whatsappResult = buildProductWhatsAppUrl({
    whatsappNumber: vendor?.whatsapp_number || '',
    productTitle: product.title,
    price: product.price,
    productUrl,
  })

  const locationExplanation =
    product.variants?.location_label?.trim() ||
    product.service_area?.trim() ||
    (vendor?.location_visibility !== 'hidden' ? vendor?.location_label?.trim() : '') ||
    ''

  const hasLocationExplanation = Boolean(locationExplanation.length > 0)
  const hasPinnedGps =
    vendor?.latitude != null &&
    vendor?.longitude != null &&
    Number.isFinite(Number(vendor.latitude)) &&
    Number.isFinite(Number(vendor.longitude))

  const googleMapsPinUrl = hasPinnedGps
    ? `https://www.google.com/maps/search/?api=1&query=${vendor!.latitude},${vendor!.longitude}`
    : null

  const facts: Array<[string, string]> = [
    ['Condition', conditionLabels[product.condition] || product.condition || 'Good'],
    ['Category', product.category?.name || 'General'],
  ]

  if (product.variants?.sizes && product.variants.sizes.length > 0) {
    facts.push(['Available Sizes', product.variants.sizes.join(', ')])
  }
  if (product.variants?.colors && product.variants.colors.length > 0) {
    facts.push(['Colors', product.variants.colors.join(', ')])
  }

  return (
    <div className="min-w-0 max-w-full pb-28">
      <div className="container mx-auto max-w-lg md:max-w-5xl px-0 md:px-6 md:pt-6">
        <div className="md:grid md:grid-cols-12 md:gap-8 md:items-start">
          {/* 1. Image Gallery matching Prototype (.dimg) */}
          <div className="dimg md:col-span-6 md:rounded-2xl md:overflow-hidden md:border md:border-border md:sticky md:top-20">
            <div className="slides">
              <div className="slide">
                <img
                  src={primaryMedia}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images &&
                product.images.slice(1).map((img, i) => (
                  <div key={i} className="slide">
                    <img
                      src={img}
                      alt={`${product.title} view ${i + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>

            {/* Floating Back Button (.ov.l) */}
            <Link href="/marketplace" className="ov l" aria-label="Back to marketplace">
              <ChevronLeft className="w-5 h-5 -ml-0.5 stroke-[2.2]" />
            </Link>

            {/* Direct Deep-Link Share Button (.ov.r) */}
            <ShareButton
              path={productPath}
              title={product.title}
              shareText={`Check out ${product.title} on Jetty (${formatNaira(product.price)} · ${product.campus || 'NMU'}):`}
              className="ov r cursor-pointer"
              iconClassName="w-4.5 h-4.5"
            />

            {/* Slide Indicator Dots (if multiple images) */}
            {product.images && product.images.length > 1 && (
              <div className="dots">
                <i className="on" />
                {product.images.slice(1).map((_, i) => (
                  <i key={i} />
                ))}
              </div>
            )}
          </div>

          {/* 2. Detail Body matching Prototype (.db) */}
          <div className="db md:col-span-6">
            {/* Price (.dp) */}
            <div className="dp">{formatNaira(product.price)}</div>

            {/* Title (.dt) */}
            <h1 className="dt">{product.title}</h1>

            {/* Metadata Row (.dmeta) */}
            <div className="dmeta">
              {isVerifiedVendor && (
                <span className="ver">
                  <VerifiedBadge size={14} />
                  <span>Verified seller</span>
                </span>
              )}
              <span>
                <MapPin className="w-3.5 h-3.5 stroke-[2]" />
                <span>{product.campus || vendor?.campus || 'NMU Campus'}</span>
              </span>
              <span>
                <Clock className="w-3.5 h-3.5 stroke-[2]" />
                <span>
                  {daysConfirmed === 0 ? 'Confirmed today' : `Confirmed ${daysConfirmed}d ago`}
                </span>
              </span>
            </div>

            {/* Divider (.dv) */}
            <div className="dv" />

            {/* Facts Definition List (.facts) */}
            <dl className="facts">
              {facts.map(([label, val]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>

            {/* Location Section: Typed explanation vs Pinned GPS Map Link */}
            {(hasLocationExplanation || googleMapsPinUrl) && (
              <div className="mt-4 p-3.5 rounded-[12px] bg-card border border-border/80 text-xs flex items-start gap-2.5 text-muted-foreground shadow-2xs">
                <MapPin className="w-4 h-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  {hasLocationExplanation && (
                    <div>
                      <b className="text-foreground">Pickup / Location: </b>
                      <span>{locationExplanation}</span>
                    </div>
                  )}
                  {googleMapsPinUrl && (
                    <a
                      href={googleMapsPinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-[#0F6E6E] dark:text-[#22D3EE] hover:underline"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open pinned location in Google Maps &rarr;</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Divider (.dv) */}
            <div className="dv" />

            {/* Seller Row (.sr) */}
            {vendor && (
              <Link
                href={`/vendors/${vendor.slug || vendor.id}`}
                className="sr group"
                aria-label={`View ${vendor.shop_name}'s storefront`}
              >
                <div className="av">
                  {vendor.logo_url ? (
                    <img
                      src={vendor.logo_url}
                      alt={vendor.shop_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{vendorInitials}</span>
                  )}
                </div>

                <div className="bd">
                  <b>
                    <span>{vendor.shop_name}</span>
                    {isVerifiedVendor && <VerifiedBadge size={15} />}
                  </b>
                  <small>Visit seller storefront</small>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}

            {/* Divider (.dv) */}
            <div className="dv" />

            {/* About this item (.hh & .dd) */}
            <h3 className="hh">About this item</h3>
            <p className="dd">{product.description}</p>

            {/* Divider (.dv) */}
            <div className="dv" />

            {/* Campus Safety Tip (.tip) */}
            <div className="tip">
              <ShieldCheck className="w-5 h-5 text-[#0F6E6E] dark:text-[#22D3EE] shrink-0 mt-0.5" />
              <span>Meet on campus in a public spot and inspect the item before you pay.</span>
            </div>

            {/* More from this seller rail */}
            {moreFromVendor.length > 0 && (
              <>
                <div className="dv" />
                <h3 className="hh">More from {vendor?.shop_name || 'seller'}</h3>
                <div className="rail flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {moreFromVendor.map((p) => (
                    <WaterlineProductCard key={p.id} product={p} />
                  ))}
                </div>
              </>
            )}

            {/* Report listing button */}
            <div className="pt-2 text-center">
              <ReportListingModal
                targetType="product"
                productId={product.id}
                vendorId={product.vendor_id}
                targetName={product.title}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar (.bar) matching Prototype */}
      <div className="bar">
        <div className="pp min-w-0">
          <b>{formatNaira(product.price)}</b>
          <small>Pay when you meet</small>
        </div>

        {whatsappResult.valid ? (
          <a
            href={whatsappResult.url}
            target="_blank"
            rel="noopener noreferrer"
            className="go"
          >
            <WhatsAppIcon className="w-4.5 h-4.5 text-white" />
            <span>Message seller</span>
          </a>
        ) : (
          <span className="text-xs text-red-500 font-semibold">Unavailable</span>
        )}
      </div>
    </div>
  )
}
