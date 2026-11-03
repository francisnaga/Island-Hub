import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ChevronRight,
  MapPin,
  Navigation,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { WaterlineProductCard } from '@/components/cards/WaterlineProductCard'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { getVendorInitials } from '@/components/cards/VendorCard'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { ProductOrderBox } from '@/components/marketplace/ProductOrderBox'
import { ProductImageGallery } from '@/components/marketplace/ProductImageGallery'
import { UserAvatar } from '@/components/brand/UserAvatar'
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
  good: 'Good',
  fair: 'Fair',
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
  const title = `${product.title} · ${formatNaira(product.price)} | Jetty NMU`

  const rawImg = product.images?.[0]
  const previewImg =
    rawImg && !rawImg.startsWith('data:')
      ? (rawImg.startsWith('http://') || rawImg.startsWith('https://')
          ? rawImg
          : getCanonicalUrl(rawImg))
      : getCanonicalUrl('/og-image.png')

  const rawDesc = product.description?.trim()
  const metaDesc =
    rawDesc && rawDesc.length > 5
      ? rawDesc
      : `${product.title} available on Jetty NMU for ${formatNaira(product.price)}. Contact seller directly on WhatsApp.`

  return {
    title,
    description: metaDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description: metaDesc,
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
      description: metaDesc,
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
    ['Condition', conditionLabels[product.condition] || product.condition || 'Brand New'],
    ['Category', product.category?.short_name || product.category?.name || 'General'],
  ]

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image:
      product.images && product.images.length > 0
        ? product.images.map((img) => (img.startsWith('http') ? img : `https://jetty.francisnaga.site${img}`))
        : ['https://jetty.francisnaga.site/og-image.png'],
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'NGN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
      seller: {
        '@type': 'Person',
        name: vendor?.shop_name || 'Jetty NMU Vendor',
      },
    },
  }

  return (
    <div className="min-w-0 max-w-full pb-28 sm:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="container mx-auto max-w-lg md:max-w-5xl px-0 md:px-6 md:pt-6">
        <div className="md:grid md:grid-cols-12 md:gap-8 md:items-start">
          {/* 1. Image Gallery */}
          <ProductImageGallery
            images={product.images || []}
            title={product.title}
            backHref="/marketplace"
            backLabel="Back to marketplace"
            sharePath={productPath}
            shareText={`Check out ${product.title} on Jetty (${formatNaira(product.price)} · ${product.campus || 'NMU'}):`}
            fallbackType="product"
            campus={product.campus || 'NMU'}
            subtitle={product.listing_type}
          />

          {/* 2. Detail Body */}
          <div className="db md:col-span-6 space-y-5">
            {/* Price & Title */}
            <div>
              <div className="font-bold text-2xl sm:text-3xl text-foreground tracking-tight font-mono-num">
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

            {/* Condition & Category (Divided Rows matching Screenshot) */}
            <div className="border-t border-b border-border/70 divide-y divide-border/60">
              {facts.map(([label, val]) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3.5 text-[15px]"
                >
                  <span className="text-muted-foreground font-normal">{label}</span>
                  <span className="font-semibold text-foreground">{val}</span>
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
                <UserAvatar
                  src={vendor.logo_url}
                  seed={vendor.id || vendor.slug}
                  name={vendor.shop_name}
                  size={48}
                  className="w-12 h-12 shrink-0 ring-2 ring-border/80 shadow-2xs group-hover:scale-105 transition-transform"
                />

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
              <h3 className="font-semibold text-lg text-foreground tracking-[-0.02em]">About this item</h3>
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
                <h3 className="font-semibold text-base text-foreground tracking-[-0.02em]">More from {vendor?.shop_name || 'seller'}</h3>
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
