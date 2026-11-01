import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  Clock,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'
import { WaterlineProductCard } from '@/components/cards/WaterlineProductCard'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { getVendorInitials } from '@/components/cards/VendorCard'
import { ShareButton } from '@/components/shared/ShareButton'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { ProductOrderBox } from '@/components/marketplace/ProductOrderBox'
import {
  getPublicProductBySlugOrId,
  getPublicProducts,
} from '@/lib/queries'
import {
  formatNaira,
  daysSinceConfirmed,
  getCanonicalUrl,
} from '@/lib/whatsapp'

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

  const previewImg =
    product.images?.[0] &&
    !product.images[0].startsWith('data:') &&
    !product.images[0].includes('cadet-uniform-tailoring.jpg')
      ? product.images[0]
      : '/og-image.png'

  return {
    title,
    description: product.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description: product.description,
      siteName: 'Jetty NMU',
      images: [
        {
          url: previewImg,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: product.description,
      images: [previewImg],
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

  // If this item is a service listing, direct users to the provider's storefront profile
  if (product.listing_type === 'service' && vendor) {
    redirect(`/vendors/${vendor.slug || vendor.id}`)
  }
  const primaryMedia =
    product.images?.[0] && !product.images[0].includes('cadet-uniform-tailoring.jpg')
      ? product.images[0]
      : null

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
    <div className="min-w-0 max-w-full pb-28 sm:pb-32">
      <div className="container mx-auto max-w-lg md:max-w-5xl px-0 md:px-6 md:pt-6">
        <div className="md:grid md:grid-cols-12 md:gap-8 md:items-start">
          {/* 1. Image Gallery */}
          <div className="dimg mx-4 mt-2 md:mx-0 md:mt-0 rounded-3xl overflow-hidden border border-border/80 shadow-xs md:col-span-6 md:sticky md:top-20">
            <div className="slides">
              <div className="slide">
                {primaryMedia ? (
                  <img
                    src={primaryMedia}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#E6F2F2] to-[#D5E7E7] dark:from-[#112323] dark:to-[#0D1818] p-6 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-[#0F6E6E]/15 dark:bg-[#14B8A6]/15 text-[#0F6E6E] dark:text-[#22D3EE] flex items-center justify-center mb-3 shadow-2xs">
                      <ShoppingBag className="w-10 h-10 stroke-[1.8]" />
                    </div>
                    <b className="text-base font-semibold text-foreground">{product.title}</b>
                    <span className="text-xs text-muted-foreground mt-1 capitalize">{product.listing_type} · {product.campus || 'NMU'}</span>
                  </div>
                )}
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

          {/* 2. Detail Body */}
          <div className="db md:col-span-6 space-y-5">
            {/* Price & Title */}
            <div>
              <div className="font-[family-name:var(--font-bricolage)] font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                {formatNaira(product.price)}
              </div>
              <h1 className="mt-1 font-semibold text-lg sm:text-xl text-foreground leading-snug">
                {product.title}
              </h1>

              {/* Metadata Row */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                {isVerifiedVendor && (
                  <span className="inline-flex items-center gap-1 font-medium text-[#0F6E6E] dark:text-[#22D3EE]">
                    <VerifiedBadge size={14} />
                    <span>Verified seller</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 stroke-[2]" />
                  <span>{product.campus || vendor?.campus || 'NMU Campus'}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 stroke-[2]" />
                  <span>
                    {daysConfirmed === 0 ? 'Confirmed today' : `Confirmed ${daysConfirmed}d ago`}
                  </span>
                </span>
              </div>
            </div>

            {/* Facts Badges (Condition, Category, Sizes) */}
            <div className="grid grid-cols-2 gap-2.5">
              {facts.map(([label, val]) => (
                <div
                  key={label}
                  className="p-3 rounded-2xl bg-card border border-border/80"
                >
                  <span className="text-[11px] font-medium text-muted-foreground block">{label}</span>
                  <span className="text-sm font-semibold text-foreground block mt-0.5 truncate">{val}</span>
                </div>
              ))}
            </div>

            {/* Interactive Quantity Selector & Options Box */}
            <ProductOrderBox
              product={product}
              vendor={vendor || null}
              productUrl={productUrl}
            />

            {/* Location Section: Typed explanation vs Pinned GPS Map Link */}
            {(hasLocationExplanation || googleMapsPinUrl) && (
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-xs flex items-start gap-3 text-muted-foreground shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] dark:text-[#22D3EE] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  {hasLocationExplanation && (
                    <div>
                      <b className="text-foreground text-sm block">Pickup & Location</b>
                      <span className="text-xs text-muted-foreground">{locationExplanation}</span>
                    </div>
                  )}
                  {googleMapsPinUrl && (
                    <a
                      href={googleMapsPinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-[#0F6E6E] dark:text-[#22D3EE] hover:underline pt-0.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open pinned location in Google Maps &rarr;</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Seller Card */}
            {vendor && (
              <Link
                href={`/vendors/${vendor.slug || vendor.id}`}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/80 hover:border-[#0F6E6E]/40 hover:bg-muted/30 transition-all group cursor-pointer"
                aria-label={`View ${vendor.shop_name}'s storefront`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 grid place-items-center text-white font-[family-name:var(--font-bricolage)] font-semibold text-lg bg-gradient-to-br from-[#17908D] to-[#0A4F4F] ring-2 ring-border">
                  {vendor.logo_url ? (
                    <img
                      src={vendor.logo_url}
                      alt={vendor.shop_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{vendorInitials}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <b className="flex items-center gap-1.5 text-base font-semibold text-foreground truncate">
                    <span>{vendor.shop_name}</span>
                    {isVerifiedVendor && <VerifiedBadge size={16} />}
                  </b>
                  <small className="text-xs text-muted-foreground block mt-0.5">Visit seller storefront & listings &rarr;</small>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            )}

            {/* About this item */}
            <div className="space-y-1.5 pt-1">
              <h3 className="font-[family-name:var(--font-bricolage)] font-semibold text-lg text-foreground">About this item</h3>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{product.description}</p>
            </div>

            {/* Campus Safety Tip */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/20 text-xs leading-relaxed text-foreground">
              <ShieldCheck className="w-5 h-5 text-[#0F6E6E] dark:text-[#22D3EE] shrink-0 mt-0.5" />
              <span>Meet on campus in a public spot and inspect the item before you pay.</span>
            </div>

            {/* More from this seller rail */}
            {moreFromVendor.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h3 className="font-[family-name:var(--font-bricolage)] font-semibold text-base text-foreground">More from {vendor?.shop_name || 'seller'}</h3>
                <div className="rail flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {moreFromVendor.map((p) => (
                    <WaterlineProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
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
    </div>
  )
}
