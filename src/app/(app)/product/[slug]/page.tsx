import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BadgeCheck,
  Store,
  Clock,
  Tag,
  AlertTriangle,
  ArrowLeft,
  Package,
  Share2,
  MessageCircle,
  CameraOff,
  MapPin,
} from 'lucide-react'
import { ProductOrderBox } from '@/components/marketplace/ProductOrderBox'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { ProductCard } from '@/components/cards/ProductCard'
import { WavyAvatar } from '@/components/brand/WavyAvatar'
import {
  getPublicProductBySlugOrId,
  getPublicProducts,
} from '@/lib/queries'
import { daysSinceConfirmed, isListingStale } from '@/lib/whatsapp'
import { Vendor } from '@/lib/types'

export const dynamic = 'force-dynamic'

const conditionLabels: Record<string, string> = {
  new: 'Brand New',
  like_new: 'Like New',
  good: 'Good (Pre-owned)',
  fair: 'Fair Condition',
}

function getSellerDistinctionLabel(vendor: Vendor): string {
  if (vendor.seller_type === 'business') {
    return vendor.business_verified ? 'Verified Business' : 'Local Business'
  }
  if (vendor.seller_type === 'independent') {
    return 'Independent Seller'
  }
  if (vendor.seller_type === 'student' || vendor.is_student) {
    return 'Student Seller'
  }
  if (vendor.location_type === 'delivery_only') return 'Delivery only'
  if (vendor.location_type === 'pickup_point') return 'Campus pickup'
  if (vendor.location_type === 'shop') return 'Physical shop'
  return 'Local seller'
}

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'maritime-cadet-gear': '/products/cadet-action-rig-navy.jpg',
  'electronics-gadgets': '/products/mi-power-bank-silver.jpg',
  'books-stationery': '/products/casio-scientific-calculator.jpg',
  'hostel-daily-essentials': '/products/rechargeable-table-fan-white.jpg',
  'fashion-accessories': '/products/cadet-beret-gloves-pack.jpg',
  'food-beauty-other': '/products/fresh-fruit-salad-bowl.jpg',
  'campus-services': '/products/cadet-uniform-tailoring.jpg',
}

function isVideoMedia(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)
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

  const { products: relatedProducts } = await getPublicProducts({
    category: product.category?.slug || product.category_id,
    limit: 5,
  })
  const moreInCategory = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  const stale = isListingStale(product.last_confirmed_at, 14)
  const daysConfirmed = daysSinceConfirmed(product.last_confirmed_at)
  const categorySlug = product.category?.slug || ''
  const primaryMedia =
    product.images?.[0] ||
    CATEGORY_FALLBACK_IMAGES[categorySlug] ||
    '/products/cadet-action-rig-navy.jpg'
  const primaryIsVideo = isVideoMedia(primaryMedia)

  const isFoodOrService =
    product.listing_type === 'food' ||
    product.listing_type === 'service' ||
    categorySlug === 'food-beauty-other' ||
    categorySlug === 'campus-services'

  return (
    <div className="py-5 sm:py-8 md:py-10 pb-24 md:pb-12 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-5 sm:space-y-6 min-w-0">
        {/* Clean Back Bar + Share Action */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Marketplace</span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Check out this on Jetty (NMU Campus Marketplace):\n🛍️ ${product.title}\n💰 ₦${product.price.toLocaleString('en-NG')} · ${product.vendor?.campus || 'NMU'}\n🔗 https://jetty.ng/product/${product.slug || product.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              title="Share on WhatsApp"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
              <span className="hidden sm:inline">Share on WhatsApp</span>
              <span className="sm:hidden">Share</span>
            </a>
          </div>
        </div>

        {/* Main 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start min-w-0">
          {/* Left Column: Product Photos & Description (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 min-w-0">
            {/* Primary Image / Video Gallery */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="aspect-square sm:aspect-4/3 w-full bg-muted relative">
                {primaryIsVideo ? (
                  <video
                    src={primaryMedia}
                    controls
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={primaryMedia}
                    alt={`${product.title} — sold by ${
                      product.vendor?.shop_name || 'verified seller on Jetty'
                    }`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-2.5 sm:p-3 border-t border-border bg-muted/40">
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg border border-border overflow-hidden bg-card"
                    >
                      <img
                        src={img}
                        alt={`${product.title} photo ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Description Card */}
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {product.category && (
                  <Link
                    href={`/category/${product.category.slug}`}
                    className="inline-flex items-center gap-1 rounded-md bg-accent border border-primary/25 px-2.5 py-1 text-xs font-semibold text-accent-foreground"
                  >
                    <Tag className="h-3 w-3" />
                    {product.category.name}
                  </Link>
                )}
                {!isFoodOrService && product.condition && (
                  <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                    {conditionLabels[product.condition] || product.condition}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {daysConfirmed === 0
                    ? 'Stock confirmed today'
                    : `Stock confirmed ${daysConfirmed}d ago`}
                </span>
              </div>

              {stale && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Availability check advised:</strong> Message the vendor on WhatsApp to confirm this item is still in stock before travelling.
                  </div>
                </div>
              )}

              <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight leading-snug">
                {product.title}
              </h1>

              {product.listing_type === 'food' && (product.food_lead_time || product.food_allergen_info) && (
                <div className="rounded-xl border border-primary/25 bg-accent/60 p-3.5 space-y-1.5 text-xs">
                  <p className="font-bold uppercase tracking-wider text-primary">
                    Made-to-Order Food &amp; Drink Details
                  </p>
                  {product.food_lead_time && (
                    <p className="text-foreground">
                      <span className="font-semibold">Preparation / Delivery Lead Time:</span> {product.food_lead_time}
                    </p>
                  )}
                  {product.food_allergen_info && (
                    <p className="text-foreground/90">
                      <span className="font-bold text-foreground">Ingredients &amp; Freshness Notice:</span> {product.food_allergen_info}
                    </p>
                  )}
                </div>
              )}

              {product.listing_type === 'service' && (product.service_turnaround || product.service_area) && (
                <div className="rounded-xl border border-primary/25 bg-accent/60 p-3.5 space-y-1.5 text-xs">
                  <p className="font-bold uppercase tracking-wider text-primary">
                    Campus Service Details
                  </p>
                  {product.service_turnaround && (
                    <p className="text-foreground">
                      <span className="font-semibold">Estimated Turnaround:</span> {product.service_turnaround}
                    </p>
                  )}
                  {product.service_area && (
                    <p className="text-foreground/90">
                      <span className="font-semibold text-foreground">Service Coverage Area:</span> {product.service_area}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-border">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description &amp; Included Items
                </h2>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Box & Vendor Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5 min-w-0">
            <ProductOrderBox product={product} />

            {/* Vendor Identity Card */}
            {product.vendor && (
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-foreground font-bold text-sm overflow-hidden shadow-2xs">
                      {product.vendor.logo_url ? (
                        <img
                          src={product.vendor.logo_url}
                          alt={`${product.vendor.shop_name} logo`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <WavyAvatar
                          name={product.vendor.shop_name}
                          seed={product.vendor.id || product.vendor.slug}
                          className="h-full w-full"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 min-w-0">
                        <Link
                          href={`/vendors/${product.vendor.slug || product.vendor.id}`}
                          className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
                        >
                          {product.vendor.shop_name}
                        </Link>
                        {product.vendor.verification_status === 'verified' && (
                          <BadgeCheck
                            className="h-4 w-4 text-primary shrink-0"
                            aria-label="Verified Vendor"
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {getSellerDistinctionLabel(product.vendor)} · {product.vendor.campus || 'Okerenkoko'}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/vendors/${product.vendor.slug || product.vendor.id}`}
                    className="inline-flex h-8 items-center px-3 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors shrink-0"
                  >
                    Visit Store
                  </Link>
                </div>

                {product.vendor.location_visibility !== 'hidden' &&
                  product.vendor.location_label && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/60">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-foreground">Pickup landmark:</strong>{' '}
                        {product.vendor.location_label}
                      </span>
                    </div>
                  )}

                {/* Quiet Report Link */}
                <div className="pt-2 border-t border-border/60 flex justify-end">
                  <ReportListingModal
                    targetType="product"
                    productId={product.id}
                    vendorId={product.vendor_id}
                    targetName={product.title}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products in Category */}
        {moreInCategory.length > 0 && (
          <section className="pt-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                More in {product.category?.name || 'Marketplace'}
              </h2>
              {product.category && (
                <Link
                  href={`/category/${product.category.slug}`}
                  className="text-xs font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline shrink-0"
                >
                  View all →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {moreInCategory.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
